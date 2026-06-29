import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../../services/rfq.service';
import { QuotationService } from '../../../services/quotation.service';
import { RfqResponse, StockCheckItem, StockCheckResultResponse } from '../../../core/models/rfq.model';
import { QuotationResponse } from '../../../core/models/quotation.model';

@Component({
  selector: 'app-review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.css']
})
export class ReviewDetailComponent implements OnInit, OnDestroy {
  rfq?: RfqResponse;
  quotation?: QuotationResponse;
  loading = false;
  approving = false;
  rejecting = false;
  stockResult?: StockCheckResultResponse;
  loadingStock = false;

  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rfqService: RfqService,
    private quotationService: QuotationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadRfq(Number(idParam));
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get stockItems(): StockCheckItem[] {
    return this.stockResult?.items ?? [];
  }

  get isStockProcessing(): boolean {
    return this.stockResult?.status === 'PROCESSING' || (!this.stockResult && this.loadingStock);
  }

  get isStockFailed(): boolean {
    return this.stockResult?.status === 'FAILED';
  }

  get isStockDone(): boolean {
    return this.stockResult?.status === 'DONE';
  }

  loadRfq(id: number): void {
    this.loading = true;
    this.rfqService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.rfq = res.data;
          this.loadStockCheck(id);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadStockCheck(id: number): void {
    this.loadingStock = true;
    this.stopPolling();
    this.rfqService.stockCheck(id).subscribe({
      next: (res) => {
        this.loadingStock = false;
        if (res.success) {
          this.stockResult = res.data;
          if (res.data.status === 'PROCESSING') {
            this.startPolling(id);
          }
        }
      },
      error: () => { this.loadingStock = false; }
    });
  }

  refreshStockCheck(): void {
    if (!this.rfq) return;
    this.loadStockCheck(this.rfq.id);
  }

  private startPolling(rfqId: number): void {
    this.pollInterval = setInterval(() => {
      this.rfqService.stockCheck(rfqId).subscribe({
        next: (res) => {
          if (res.success) {
            this.stockResult = res.data;
            if (res.data.status !== 'PROCESSING') {
              this.stopPolling();
              if (this.rfq && this.rfq.status === 'PROCESSING') {
                this.rfqService.getById(rfqId).subscribe({
                  next: r => { if (r.success) this.rfq = r.data; }
                });
              }
            }
          }
        }
      });
    }, 3000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  approve(): void {
    if (!this.rfq) return;
    this.approving = true;
    this.rfqService.confirm(this.rfq.id).subscribe({
      next: (res) => {
        this.approving = false;
        if (res.success) {
          this.loadQuotation(res.data);
        }
      },
      error: (err) => {
        console.error('Error aprobando RFQ', err);
        alert('Hubo un error al aprobar la cotización.');
        this.approving = false;
      }
    });
  }

  loadQuotation(quotationId: number): void {
    this.quotationService.getById(quotationId).subscribe({
      next: (res) => {
        if (res.success) {
          this.quotation = res.data;
        }
      },
      error: (err) => console.error('Error cargando cotización generada', err)
    });
  }

  reject(): void {
    if (!this.rfq) return;
    if (!confirm('¿Seguro que deseas rechazar este RFQ? No se generará cotización.')) return;
    this.rejecting = true;
    this.rfqService.reject(this.rfq.id).subscribe({
      next: (res) => {
        if (res.success) {
          alert('RFQ rechazado.');
          this.router.navigate(['/cotizaciones']);
        }
        this.rejecting = false;
      },
      error: (err) => {
        console.error('Error rechazando RFQ', err);
        alert('Hubo un error al rechazar el RFQ.');
        this.rejecting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cotizaciones']);
  }

  getDisplayStatus(status: string): string {
    switch (status) {
      case 'PROCESSING':    return 'Procesando';
      case 'PENDING_REVIEW': return 'Por aprobar';
      case 'QUOTING':       return 'Cotizando';
      case 'QUOTED':        return 'Cotizado';
      case 'REJECTED':      return 'Rechazado';
      default: return status;
    }
  }

  formatPercent(value: number | null | undefined): string {
    return value != null ? `${Math.round(value * 100)}%` : '-';
  }

  hasStockIssue(item: StockCheckItem): boolean {
    return !item.matched || item.stockSufficient === false;
  }

  getUnitPrice(rfqItemId: number): number | undefined {
    return this.stockItems.find(s => s.rfqItemId === rfqItemId && s.matched)?.unitPrice;
  }

  getEstimatedSubtotal(): number {
    if (!this.rfq) return 0;
    return this.rfq.items.reduce((sum, item) => {
      const price = this.getUnitPrice(item.id);
      return sum + (price != null ? price * item.quantity : 0);
    }, 0);
  }

  getEstimatedIgv(): number {
    return this.getEstimatedSubtotal() * 0.18;
  }

  getEstimatedTotal(): number {
    return this.getEstimatedSubtotal() + this.getEstimatedIgv();
  }
}

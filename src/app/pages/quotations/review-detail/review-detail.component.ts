import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../../services/rfq.service';
import { QuotationService } from '../../../services/quotation.service';
import { RfqResponse, StockCheckItem } from '../../../core/models/rfq.model';
import { QuotationResponse } from '../../../core/models/quotation.model';

@Component({
  selector: 'app-review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.css']
})
export class ReviewDetailComponent implements OnInit {
  rfq?: RfqResponse;
  quotation?: QuotationResponse;
  loading = false;
  approving = false;
  rejecting = false;
  stockItems: StockCheckItem[] = [];
  loadingStock = false;

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
      error: (err) => {
        console.error('Error cargando RFQ', err);
        this.loading = false;
      }
    });
  }

  loadStockCheck(id: number): void {
    this.loadingStock = true;
    this.rfqService.stockCheck(id).subscribe({
      next: (res) => {
        if (res.success) this.stockItems = res.data;
        this.loadingStock = false;
      },
      error: () => { this.loadingStock = false; }
    });
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
      case 'PENDING_REVIEW': return 'Por aprobar';
      case 'IN_PROGRESS': return 'En proceso';
      case 'QUOTED': return 'Cotizado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  formatPercent(value: number | null | undefined): string {
    return value != null ? `${Math.round(value * 100)}%` : '-';
  }

  hasStockIssue(item: StockCheckItem): boolean {
    return !item.matched || item.stockSufficient === false;
  }
}

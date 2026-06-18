import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../../services/rfq.service';
import { QuotationService } from '../../../services/quotation.service';
import { RfqResponse } from '../../../core/models/rfq.model';
import { QuotationResponse } from '../../../core/models/quotation.model';

interface StockItem {
  product: string;
  requested: number;
  inStock: number;
}

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

  // Dato de ejemplo: solo se usa antes de aprobar, mientras no existe verificación de stock real
  stockItems: StockItem[] = [
    { product: 'Estufa de secado 1000L',    requested: 1, inStock: 3 },
    { product: 'Balanza precisión 220gr',   requested: 2, inStock: 5 },
    { product: 'Sensor temperatura tipo K', requested: 2, inStock: 1 },
    { product: 'Termómetro infrarojo',      requested: 1, inStock: 0 },
    { product: 'Termohigrómetro ext.',      requested: 1, inStock: 2 },
    { product: 'Pesas calibración F1',      requested: 3, inStock: 2 },
  ];

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
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando RFQ', err);
        this.loading = false;
      }
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

  hasStockIssue(item: StockItem): boolean {
    return item.inStock < item.requested;
  }
}

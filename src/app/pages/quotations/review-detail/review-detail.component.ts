import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RfqService } from '../../../services/rfq.service';
import { RfqResponse } from '../../../core/models/rfq.model';

@Component({
  selector: 'app-review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.css']
})
export class ReviewDetailComponent implements OnInit {
  rfq?: RfqResponse;
  loading = false;
  approving = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private rfqService: RfqService
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
        if (res.success) {
          alert('Cotización generada exitosamente.');
          this.router.navigate(['/cotizaciones']);
        }
        this.approving = false;
      },
      error: (err) => {
        console.error('Error aprobando RFQ', err);
        alert('Hubo un error al aprobar la cotización.');
        this.approving = false;
      }
    });
  }

  goBack(): void { 
    this.router.navigate(['/cotizaciones']); 
  }
}

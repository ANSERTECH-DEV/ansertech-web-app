import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RfqService } from '../../../services/rfq.service';
import { RfqResponse } from '../../../core/models/rfq.model';

@Component({
  selector: 'app-pending-list',
  templateUrl: './pending-list.component.html',
  styleUrls: ['./pending-list.component.css']
})
export class PendingListComponent implements OnInit {
  stateOptions: any[] = [
    { name: 'Todas',        value: 'Todas' },
    { name: 'Procesando',   value: 'Procesando' },
    { name: 'Por aprobar',  value: 'Por aprobar' },
    { name: 'Cotizando',    value: 'Cotizando' },
  ];
  activeTab = 'Todas';
  items: RfqResponse[] = [];
  totalItems: number = 0;
  refreshing = false;

  constructor(private rfqService: RfqService, private router: Router) {}

  ngOnInit(): void { this.applyFilter(); }

  applyFilter(): void {
    this.rfqService.getRfqs(this.activeTab).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.content;
          this.totalItems = res.data.totalElements;
        }
        this.refreshing = false;
      },
      error: (err) => { console.error('Error fetching RFQs', err); this.refreshing = false; }
    });
  }

  refresh(): void {
    this.refreshing = true;
    this.applyFilter();
  }

  getDisplayStatus(status: string): string {
    switch (status) {
      case 'PROCESSING':    return 'Procesando';
      case 'PENDING_REVIEW':return 'Por aprobar';
      case 'QUOTING':       return 'Cotizando';
      case 'QUOTED':        return 'Cotizado';
      case 'REJECTED':      return 'Rechazado';
      default:              return status;
    }
  }

  isClickable(item: RfqResponse): boolean {
    return item.status === 'PENDING_REVIEW' || item.status === 'PROCESSING';
  }

  goToChecking(item: RfqResponse): void {
    if (this.isClickable(item)) {
      this.router.navigate(['/cotizaciones', item.id, 'checking']);
    }
  }
}

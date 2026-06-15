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
  stateOptions:any[]=[
    {name: 'Todas',value: 'Todas'},
    {name: 'En proceso',value: 'En proceso'},
    {name: 'Por aprobar',value: 'Por aprobar'}
  ]
  activeTab = 'Todas';
  items: RfqResponse[] = [];
  totalItems: number = 0;

  constructor(private rfqService: RfqService, private router: Router) {}

  ngOnInit(): void { this.applyFilter(); }

  applyFilter(): void {
    this.rfqService.getRfqs(this.activeTab).subscribe({
      next: (res) => {
        if (res.success) {
          this.items = res.data.content;
          this.totalItems = res.data.totalElements;
        }
      },
      error: (err) => console.error('Error fetching RFQs', err)
    });
  }

  getDisplayStatus(status: string): string {
    switch(status) {
      case 'IN_PROGRESS': return 'En proceso';
      case 'PENDING_REVIEW': return 'Por aprobar';
      case 'QUOTED': return 'Cotizado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  goToChecking(item: RfqResponse): void {
    this.router.navigate(['/cotizaciones', item.id, 'checking']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailService } from '../../../services/email.service';
import { ParameterService } from '../../../services/parameter.service';
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

  readingEmails = false;
  readEmailsMessage = '';
  readEmailsFailed = false;
  /** Valor del parámetro "Cantidad de correos"; null si aún no llega o no se pudo leer. */
  emailCount: number | null = null;

  constructor(
    private rfqService: RfqService,
    private emailService: EmailService,
    private parameterService: ParameterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applyFilter();
    this.loadEmailCount();
  }

  get readEmailsLabel(): string {
    if (!this.emailCount) return 'Leer los últimos correos';
    return this.emailCount === 1 ? 'Leer el último correo' : `Leer los últimos ${this.emailCount} correos`;
  }

  private loadEmailCount(): void {
    this.parameterService.getEmailCount().subscribe({
      next: (res) => { this.emailCount = res.data ?? null; },
      error: () => { this.emailCount = null; }
    });
  }

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

  /** El backend responde al instante y lee los correos en segundo plano. */
  readLatestEmails(): void {
    this.readingEmails = true;
    this.readEmailsMessage = '';
    this.readEmailsFailed = false;
    this.emailService.triggerPolling().subscribe({
      next: (res) => {
        this.readingEmails = false;
        this.readEmailsMessage = res.message;
      },
      error: (err: HttpErrorResponse) => {
        this.readingEmails = false;
        this.readEmailsFailed = true;
        this.readEmailsMessage = err.status === 403
          ? 'Solo un administrador puede leer los correos.'
          : 'No se pudo iniciar la lectura de correos.';
      }
    });
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

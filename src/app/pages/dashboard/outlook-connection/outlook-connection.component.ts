import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { GraphAuthService } from '../../../services/graph-auth.service';
import { GraphConnection } from '../../../core/models/graph.model';

/**
 * Tarjeta "Conexión con Outlook": muestra el estado de la vinculación con Microsoft Graph y,
 * cuando el backend pide iniciar sesión, la URL y el código del Device Code Flow.
 * Solo la ven los ADMIN: si el backend responde 403, la tarjeta no se muestra.
 */
@Component({
  selector: 'app-outlook-connection',
  templateUrl: './outlook-connection.component.html',
  styleUrls: ['./outlook-connection.component.css']
})
export class OutlookConnectionComponent implements OnInit, OnDestroy {
  static readonly POLL_MS = 5000;

  visible = true;
  loading = false;
  connecting = false;
  connection: GraphConnection | null = null;
  error = '';
  copied = false;

  showLogs = false;
  logLines = 50;
  logs = '';
  logsLoading = false;

  private poll?: Subscription;

  constructor(private graphAuth: GraphAuthService) {}

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get status(): string {
    return this.connection?.status ?? 'NOT_CONNECTED';
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'CONNECTED': return 'Conectado';
      case 'PENDING': return 'Esperando inicio de sesión';
      case 'ERROR': return 'Error';
      default: return 'Sin verificar';
    }
  }

  refresh(): void {
    this.loading = true;
    this.graphAuth.getStatus().subscribe({
      next: res => { this.loading = false; this.apply(res.data); },
      error: (err: HttpErrorResponse) => { this.loading = false; this.handleError(err); }
    });
  }

  connect(): void {
    this.connecting = true;
    this.error = '';
    this.graphAuth.connect().subscribe({
      next: res => { this.connecting = false; this.apply(res.data); },
      error: (err: HttpErrorResponse) => { this.connecting = false; this.handleError(err); }
    });
  }

  copyCode(): void {
    const code = this.connection?.code;
    if (!code || !navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  toggleLogs(): void {
    this.showLogs = !this.showLogs;
    if (this.showLogs) this.loadLogs();
  }

  loadLogs(): void {
    this.logsLoading = true;
    this.graphAuth.getLogs(this.logLines).subscribe({
      next: text => { this.logsLoading = false; this.logs = text; },
      error: () => { this.logsLoading = false; this.logs = 'No se pudo leer el log del servidor.'; }
    });
  }

  private apply(data: GraphConnection): void {
    this.connection = data;
    this.error = '';
    // Mientras hay un código pendiente se consulta cada 5 s para detectar cuándo se completa.
    if (data?.status === 'PENDING') this.startPolling();
    else this.stopPolling();
  }

  private handleError(err: HttpErrorResponse): void {
    if (err.status === 403) {
      this.visible = false;  // usuario OPERATOR: la vinculación es solo para administradores
      this.stopPolling();
      return;
    }
    this.error = err.status === 0
      ? 'No se pudo contactar al servidor.'
      : (err.error?.message || 'No se pudo consultar el estado de Outlook.');
  }

  private startPolling(): void {
    if (this.poll) return;
    this.poll = interval(OutlookConnectionComponent.POLL_MS).subscribe(() => {
      this.graphAuth.getStatus().subscribe({
        next: res => this.apply(res.data),
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
    });
  }

  private stopPolling(): void {
    this.poll?.unsubscribe();
    this.poll = undefined;
  }
}

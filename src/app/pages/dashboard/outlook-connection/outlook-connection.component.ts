import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { GraphAuthService } from '../../../services/graph-auth.service';
import { GraphConnection } from '../../../core/models/graph.model';

/**
 * Tarjeta "Conexión con Outlook": al pulsar "Actualizar" lee del log del backend la URL y el código
 * de Microsoft para que el usuario los ingrese manualmente. No consulta sola ni espera resultados.
 * Solo es para ADMIN: si el backend responde 403, la tarjeta se oculta.
 */
@Component({
  selector: 'app-outlook-connection',
  templateUrl: './outlook-connection.component.html',
  styleUrls: ['./outlook-connection.component.css']
})
export class OutlookConnectionComponent {
  visible = true;
  loading = false;
  consulted = false;
  connection: GraphConnection | null = null;
  error = '';
  copied = false;

  showLogs = false;
  logLines = 50;
  logs = '';
  logsLoading = false;

  constructor(private graphAuth: GraphAuthService) {}

  get hasCode(): boolean {
    return !!this.connection?.url && !!this.connection?.code;
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.graphAuth.getStatus().subscribe({
      next: res => {
        this.loading = false;
        this.consulted = true;
        this.connection = res.data;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.connection = null;
        this.handleError(err);
      }
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

  private handleError(err: HttpErrorResponse): void {
    if (err.status === 403) {
      this.visible = false;  // usuario OPERATOR: la vinculación es solo para administradores
      return;
    }
    this.error = err.status === 0
      ? 'No se pudo contactar al servidor.'
      : (err.error?.message || 'No se pudo leer el código de Microsoft.');
  }
}

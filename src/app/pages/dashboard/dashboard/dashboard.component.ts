import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  exporting = false;
  exportingInventory = false;

  statusBars = [
    { label: 'En cola',    pct: 50, color: '#d97706', value: 8 },
    { label: 'En proceso', pct: 31, color: '#3a8fd1', value: 5 },
    { label: 'Checking',   pct: 19, color: '#059669', value: 3 },
  ];

  clientBars = [
    { label: 'Minera Los Andes', pct: 80, value: 6 },
    { label: 'Industrias Perú',  pct: 55, value: 4 },
    { label: 'AgroTech SAC',     pct: 38, value: 3 },
  ];

  constructor(private http: HttpClient) {}

  exportEmails(): void {
    this.exporting = true;
    this.http.get(`${environment.apiUrl}/emails/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-correos-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: (err) => {
        console.error('Error exportando reporte', err);
        alert('Error al generar el reporte. Intente nuevamente.');
        this.exporting = false;
      }
    });
  }

  exportInventory(): void {
    this.exportingInventory = true;
    this.http.get(`${environment.apiUrl}/inventory/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportingInventory = false;
      },
      error: (err) => {
        console.error('Error exportando inventario', err);
        alert('Error al generar el inventario. Intente nuevamente.');
        this.exportingInventory = false;
      }
    });
  }
}

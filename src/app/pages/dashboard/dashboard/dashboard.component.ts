import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardKpisResponse, KpiPeriod } from '../../../core/models/dashboard.model';

type KpiPreset = 'thisMonth' | 'lastMonth' | 'last30' | 'thisYear' | 'custom';
type BadgeTone = 'green' | 'red' | 'gray';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  exporting = false;
  exportingInventory = false;

  /** Rango para el reporte de correos (formato yyyy-MM-dd de <input type="date">). Vacío = sin límite. */
  fromDate = '';
  toDate = '';
  readonly today = this.toIsoDate(new Date());

  // ── KPIs con filtro de fechas ──
  readonly kpiPresets: { value: KpiPreset; label: string }[] = [
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes anterior' },
    { value: 'last30',    label: 'Últimos 30 días' },
    { value: 'thisYear',  label: 'Este año' },
    { value: 'custom',    label: 'Personalizado' },
  ];
  readonly approvalGoal = 70;
  kpiPreset: KpiPreset = 'thisMonth';
  kpiFrom = '';
  kpiTo = '';
  kpis: DashboardKpisResponse | null = null;
  kpiLoading = false;
  kpiError = '';

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

  constructor(private http: HttpClient, private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.applyPreset('thisMonth');
  }

  // ── KPIs ────────────────────────────────────────────────────────────────

  get kpiInvalidRange(): boolean {
    return !this.kpiFrom || !this.kpiTo || this.kpiFrom > this.kpiTo;
  }

  get cur(): KpiPeriod | null { return this.kpis?.current ?? null; }
  get prev(): KpiPeriod | null { return this.kpis?.previous ?? null; }

  onPresetChange(preset: KpiPreset): void {
    this.applyPreset(preset);
  }

  /** Al editar una fecha a mano el periodo pasa a "Personalizado". */
  onKpiDateChange(): void {
    this.kpiPreset = 'custom';
    this.loadKpis();
  }

  applyPreset(preset: KpiPreset): void {
    this.kpiPreset = preset;
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    switch (preset) {
      case 'thisMonth':
        this.kpiFrom = this.toIsoDate(new Date(y, m, 1));
        this.kpiTo = this.today;
        break;
      case 'lastMonth':
        this.kpiFrom = this.toIsoDate(new Date(y, m - 1, 1));
        this.kpiTo = this.toIsoDate(new Date(y, m, 0));
        break;
      case 'last30':
        this.kpiFrom = this.toIsoDate(new Date(y, m, now.getDate() - 29));
        this.kpiTo = this.today;
        break;
      case 'thisYear':
        this.kpiFrom = this.toIsoDate(new Date(y, 0, 1));
        this.kpiTo = this.today;
        break;
      case 'custom':
        return; // conserva las fechas actuales
    }
    this.loadKpis();
  }

  loadKpis(): void {
    if (this.kpiInvalidRange) return;
    this.kpiLoading = true;
    this.kpiError = '';
    this.dashboardService.getKpis(this.kpiFrom, this.kpiTo).subscribe({
      next: (res) => {
        this.kpis = res.data;
        this.kpiLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando KPIs', err);
        this.kpiError = err.error?.message || 'No se pudieron cargar los KPIs.';
        this.kpiLoading = false;
      }
    });
  }

  formatMoney(value: number | null | undefined): string {
    const v = value ?? 0;
    if (v >= 1_000_000) return `S/${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `S/${(v / 1_000).toFixed(1)}k`;
    return `S/${Math.round(v)}`;
  }

  /** Menos de 1 día se muestra en horas; si no, en días. */
  formatDuration(hours: number | null | undefined): string {
    if (hours == null) return '—';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  }

  formatRate(rate: number | null | undefined): string {
    return rate == null ? '—' : `${Math.round(rate)}%`;
  }

  /** Variación porcentual del total cotizado frente al periodo anterior. */
  totalBadge(): { text: string; tone: BadgeTone } {
    const c = this.cur?.totalQuoted ?? 0, p = this.prev?.totalQuoted ?? 0;
    if (p === 0) return c > 0 ? { text: 'Sin datos periodo ant.', tone: 'gray' } : { text: 'Sin movimiento', tone: 'gray' };
    const pct = Math.round(((c - p) / p) * 100);
    if (pct === 0) return { text: '= periodo ant.', tone: 'gray' };
    return { text: `${pct > 0 ? '+' : ''}${pct}% periodo ant.`, tone: pct > 0 ? 'green' : 'red' };
  }

  /** Diferencia absoluta de aprobadas frente al periodo anterior. */
  approvedBadge(): { text: string; tone: BadgeTone } {
    const diff = (this.cur?.approved ?? 0) - (this.prev?.approved ?? 0);
    if (diff === 0) return { text: '= periodo ant.', tone: 'gray' };
    return { text: `${diff > 0 ? '+' : ''}${diff} vs periodo ant.`, tone: diff > 0 ? 'green' : 'red' };
  }

  rateBadgeTone(): BadgeTone {
    const r = this.cur?.approvalRate;
    if (r == null) return 'gray';
    return r >= this.approvalGoal ? 'green' : 'red';
  }

  get invalidRange(): boolean {
    return !!this.fromDate && !!this.toDate && this.fromDate > this.toDate;
  }

  get hasRange(): boolean {
    return !!this.fromDate || !!this.toDate;
  }

  clearRange(): void {
    this.fromDate = '';
    this.toDate = '';
  }

  exportEmails(): void {
    if (this.invalidRange) return;
    this.exporting = true;

    let params = new HttpParams();
    if (this.fromDate) params = params.set('from', this.fromDate);
    if (this.toDate)   params = params.set('to', this.toDate);

    this.http.get(`${environment.apiUrl}/emails/export`, { params, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.emailReportFilename();
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error exportando reporte', err);
        this.exporting = false;
        this.showBlobError(err, 'Error al generar el reporte. Intente nuevamente.');
      }
    });
  }

  private emailReportFilename(): string {
    if (!this.hasRange) return `reporte-correos-${this.today}.xlsx`;
    return `reporte-correos_${this.fromDate || 'inicio'}_a_${this.toDate || this.today}.xlsx`;
  }

  /** Con responseType 'blob' el JSON de error del backend llega como Blob: se lee para mostrar su mensaje. */
  private showBlobError(err: HttpErrorResponse, fallback: string): void {
    if (err.error instanceof Blob) {
      err.error.text()
        .then(text => alert(JSON.parse(text)?.message || fallback))
        .catch(() => alert(fallback));
    } else {
      alert(fallback);
    }
  }

  private toIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  exportInventory(): void {
    this.exportingInventory = true;
    this.http.get(`${environment.apiUrl}/inventory/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario-${this.today}.xlsx`;
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

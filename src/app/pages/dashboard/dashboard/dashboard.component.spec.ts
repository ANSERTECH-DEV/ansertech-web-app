import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardKpisResponse, KpiPeriod } from '../../../core/models/dashboard.model';

const period = (p: Partial<KpiPeriod>): KpiPeriod => ({
  totalQuoted: 0, approved: 0, rejected: 0, sent: 0, avgHoursToQuote: null, approvalRate: null, ...p
});

describe('DashboardComponent (KPIs)', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let getKpis: jasmine.Spy;

  const response = (cur: Partial<KpiPeriod>, prev: Partial<KpiPeriod>): DashboardKpisResponse => ({
    from: '2026-10-01', to: '2026-10-31', previousFrom: '2026-08-31', previousTo: '2026-09-30',
    current: period(cur), previous: period(prev)
  });

  beforeEach(() => {
    getKpis = jasmine.createSpy('getKpis').and.returnValue(of({ success: true, message: '', data: response({}, {}) }));
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: DashboardService, useValue: { getKpis } }]
    });
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('al iniciar carga los KPIs del mes actual hasta hoy', () => {
    fixture.detectChanges();
    expect(component.kpiPreset).toBe('thisMonth');
    expect(component.kpiFrom.endsWith('-01')).toBeTrue();
    expect(component.kpiTo).toBe(component.today);
    expect(getKpis).toHaveBeenCalledWith(component.kpiFrom, component.today);
  });

  it('"Mes anterior" va del 1 al último día del mes previo', () => {
    component.applyPreset('lastMonth');
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    expect(component.kpiFrom.endsWith('-01')).toBeTrue();
    expect(component.kpiTo.endsWith(`-${String(lastDay).padStart(2, '0')}`)).toBeTrue();
  });

  it('editar una fecha pasa a "Personalizado" y no consulta con un rango invertido', () => {
    component.kpiFrom = '2026-10-20';
    component.kpiTo = '2026-10-10';
    getKpis.calls.reset();
    component.onKpiDateChange();
    expect(component.kpiPreset).toBe('custom');
    expect(component.kpiInvalidRange).toBeTrue();
    expect(getKpis).not.toHaveBeenCalled();
  });

  it('calcula los badges de comparación con el periodo anterior', () => {
    component.kpis = response({ totalQuoted: 1500, approved: 5, approvalRate: 80 }, { totalQuoted: 1000, approved: 7 });
    expect(component.totalBadge()).toEqual({ text: '+50% periodo ant.', tone: 'green' });
    expect(component.approvedBadge()).toEqual({ text: '-2 vs periodo ant.', tone: 'red' });
    expect(component.rateBadgeTone()).toBe('green');
  });

  it('formatea montos, tiempos y tasas', () => {
    expect(component.formatMoney(28400)).toBe('S/28.4k');
    expect(component.formatMoney(950)).toBe('S/950');
    expect(component.formatDuration(5.24)).toBe('5.2h');
    expect(component.formatDuration(76.8)).toBe('3.2d');
    expect(component.formatDuration(null)).toBe('—');
    expect(component.formatRate(null)).toBe('—');
  });
});

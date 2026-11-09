import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { OutlookConnectionComponent } from './outlook-connection.component';
import { GraphAuthService } from '../../../services/graph-auth.service';
import { GraphConnection } from '../../../core/models/graph.model';

describe('OutlookConnectionComponent', () => {
  let fixture: ComponentFixture<OutlookConnectionComponent>;
  let component: OutlookConnectionComponent;
  let graphAuth: jasmine.SpyObj<GraphAuthService>;

  const ok = (data: GraphConnection) => of({ success: true, message: '', data });
  const pending: GraphConnection = {
    status: 'PENDING', url: 'https://microsoft.com/devicelogin', code: 'ABCD2345',
    expiresOn: '2026-11-08T22:15:00Z', source: 'MEMORY'
  };

  beforeEach(() => {
    graphAuth = jasmine.createSpyObj('GraphAuthService', ['getStatus', 'connect', 'getLogs']);
    TestBed.configureTestingModule({
      declarations: [OutlookConnectionComponent],
      imports: [FormsModule],
      providers: [{ provide: GraphAuthService, useValue: graphAuth }]
    });
    fixture = TestBed.createComponent(OutlookConnectionComponent);
    component = fixture.componentInstance;
  });

  it('muestra la URL y el código cuando la vinculación está pendiente', () => {
    graphAuth.getStatus.and.returnValue(ok(pending));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ABCD2345');
    expect(text).toContain('https://microsoft.com/devicelogin');
    expect(component.statusLabel).toBe('Esperando inicio de sesión');
    component.ngOnDestroy();
  });

  it('se oculta para usuarios sin rol ADMIN (403)', () => {
    graphAuth.getStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    fixture.detectChanges();

    expect(component.visible).toBeFalse();
    expect(fixture.nativeElement.querySelector('.dash-card')).toBeNull();
  });

  it('mientras está pendiente consulta cada 5 s y deja de hacerlo al conectarse', fakeAsync(() => {
    graphAuth.getStatus.and.returnValues(ok(pending), ok({ status: 'CONNECTED' }));
    fixture.detectChanges();
    expect(graphAuth.getStatus).toHaveBeenCalledTimes(1);

    tick(OutlookConnectionComponent.POLL_MS);
    expect(graphAuth.getStatus).toHaveBeenCalledTimes(2);
    expect(component.status).toBe('CONNECTED');

    tick(OutlookConnectionComponent.POLL_MS * 2);
    expect(graphAuth.getStatus).toHaveBeenCalledTimes(2);
    discardPeriodicTasks();
  }));

  it('"Conectar Outlook" llama a connect y muestra el código devuelto', () => {
    graphAuth.getStatus.and.returnValue(ok({ status: 'NOT_CONNECTED' }));
    graphAuth.connect.and.returnValue(ok(pending));
    fixture.detectChanges();

    component.connect();
    fixture.detectChanges();

    expect(graphAuth.connect).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('ABCD2345');
    component.ngOnDestroy();
  });

  it('muestra el error devuelto por el backend', () => {
    graphAuth.getStatus.and.returnValue(ok({ status: 'ERROR', error: 'El código venció' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El código venció');
  });
});

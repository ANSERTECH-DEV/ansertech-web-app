import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
    expiresOn: '2026-11-08T22:15:00Z', source: 'LOG'
  };

  const clickActualizar = () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-export');
    button.click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    graphAuth = jasmine.createSpyObj('GraphAuthService', ['getStatus', 'getLogs']);
    TestBed.configureTestingModule({
      declarations: [OutlookConnectionComponent],
      imports: [FormsModule],
      providers: [{ provide: GraphAuthService, useValue: graphAuth }]
    });
    fixture = TestBed.createComponent(OutlookConnectionComponent);
    component = fixture.componentInstance;
  });

  it('no consulta al backend hasta que se pulsa "Actualizar"', () => {
    fixture.detectChanges();

    expect(graphAuth.getStatus).not.toHaveBeenCalled();
  });

  it('"Actualizar" muestra la URL y el código leídos del log', () => {
    graphAuth.getStatus.and.returnValue(ok(pending));
    fixture.detectChanges();

    clickActualizar();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('ABCD2345');
    expect(text).toContain('https://microsoft.com/devicelogin');
  });

  it('no vuelve a consultar por su cuenta aunque haya un código vigente', fakeAsync(() => {
    graphAuth.getStatus.and.returnValue(ok(pending));
    fixture.detectChanges();
    clickActualizar();

    tick(60000);

    expect(graphAuth.getStatus).toHaveBeenCalledTimes(1);
  }));

  it('no ofrece el botón "Conectar Outlook"', () => {
    graphAuth.getStatus.and.returnValue(ok({ status: 'NOT_CONNECTED' }));
    fixture.detectChanges();
    clickActualizar();

    expect(fixture.nativeElement.textContent).not.toContain('Conectar Outlook');
  });

  it('avisa cuando el log no tiene un código vigente', () => {
    graphAuth.getStatus.and.returnValue(ok({ status: 'NOT_CONNECTED' }));
    fixture.detectChanges();

    clickActualizar();

    expect(fixture.nativeElement.textContent).toContain('No hay un código vigente');
  });

  it('se oculta para usuarios sin rol ADMIN (403)', () => {
    graphAuth.getStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    fixture.detectChanges();

    clickActualizar();

    expect(component.visible).toBeFalse();
    expect(fixture.nativeElement.querySelector('.dash-card')).toBeNull();
  });

  it('muestra un error si no se puede contactar al servidor', () => {
    graphAuth.getStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fixture.detectChanges();

    clickActualizar();

    expect(fixture.nativeElement.textContent).toContain('No se pudo contactar al servidor');
  });
});

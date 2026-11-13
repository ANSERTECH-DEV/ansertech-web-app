import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { PendingListComponent } from './pending-list.component';
import { RfqService } from '../../../services/rfq.service';
import { EmailService } from '../../../services/email.service';
import { ParameterService } from '../../../services/parameter.service';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('PendingListComponent — Leer los últimos correos', () => {
  let fixture: ComponentFixture<PendingListComponent>;
  let emailService: jasmine.SpyObj<EmailService>;
  let parameterService: jasmine.SpyObj<ParameterService>;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('.btn-read-emails');
  const text = (): string => fixture.nativeElement.querySelector('.read-emails').textContent;

  const create = () => {
    fixture = TestBed.createComponent(PendingListComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    const rfqService = jasmine.createSpyObj('RfqService', ['getRfqs']);
    rfqService.getRfqs.and.returnValue(of({ success: true, message: '', data: { content: [], totalElements: 0 } }));
    emailService = jasmine.createSpyObj('EmailService', ['triggerPolling']);
    parameterService = jasmine.createSpyObj('ParameterService', ['getEmailCount']);
    parameterService.getEmailCount.and.returnValue(of({ success: true, message: '', data: 5 }));
    TestBed.configureTestingModule({
      declarations: [PendingListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RfqService, useValue: rfqService },
        { provide: EmailService, useValue: emailService },
        { provide: ParameterService, useValue: parameterService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });
    create();
  });

  it('muestra en el botón la cantidad de correos del parámetro', () => {
    expect(parameterService.getEmailCount).toHaveBeenCalledTimes(1);
    expect(button().textContent).toContain('Leer los últimos 5 correos');
    expect(emailService.triggerPolling).not.toHaveBeenCalled();
  });

  it('usa singular cuando el parámetro vale 1', () => {
    parameterService.getEmailCount.and.returnValue(of({ success: true, message: '', data: 1 }));
    create();

    expect(button().textContent).toContain('Leer el último correo');
  });

  it('muestra el texto genérico si no se pudo leer el parámetro', () => {
    parameterService.getEmailCount.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    create();

    expect(button().textContent).toContain('Leer los últimos correos');
  });

  it('muestra el mensaje del backend cuando la lectura se inicia', () => {
    emailService.triggerPolling.and.returnValue(of({ success: true, message: 'Lectura de correos iniciada.', data: 'STARTED' }));

    button().click();
    fixture.detectChanges();

    expect(emailService.triggerPolling).toHaveBeenCalledTimes(1);
    expect(text()).toContain('Lectura de correos iniciada.');
    expect(button().disabled).toBeFalse();
  });

  it('solo deshabilita el botón mientras espera la respuesta', () => {
    const response = new Subject<ApiResponse<any>>();
    emailService.triggerPolling.and.returnValue(response);

    button().click();
    fixture.detectChanges();
    expect(button().disabled).toBeTrue();

    response.next({ success: true, message: 'ok', data: 'STARTED' });
    fixture.detectChanges();
    expect(button().disabled).toBeFalse();
  });

  it('avisa cuando el usuario no es administrador (403)', () => {
    emailService.triggerPolling.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));

    button().click();
    fixture.detectChanges();

    expect(text()).toContain('Solo un administrador');
  });

  it('avisa cuando no se puede iniciar la lectura', () => {
    emailService.triggerPolling.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    button().click();
    fixture.detectChanges();

    expect(text()).toContain('No se pudo iniciar');
  });
});

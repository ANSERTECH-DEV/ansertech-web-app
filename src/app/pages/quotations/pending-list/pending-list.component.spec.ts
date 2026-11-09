import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { PendingListComponent } from './pending-list.component';
import { RfqService } from '../../../services/rfq.service';
import { EmailService } from '../../../services/email.service';
import { ApiResponse } from '../../../core/models/api-response.model';

describe('PendingListComponent — Leer los últimos correos', () => {
  let fixture: ComponentFixture<PendingListComponent>;
  let emailService: jasmine.SpyObj<EmailService>;

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('.btn-read-emails');
  const text = (): string => fixture.nativeElement.querySelector('.read-emails').textContent;

  beforeEach(() => {
    const rfqService = jasmine.createSpyObj('RfqService', ['getRfqs']);
    rfqService.getRfqs.and.returnValue(of({ success: true, message: '', data: { content: [], totalElements: 0 } }));
    emailService = jasmine.createSpyObj('EmailService', ['triggerPolling']);
    TestBed.configureTestingModule({
      declarations: [PendingListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: RfqService, useValue: rfqService },
        { provide: EmailService, useValue: emailService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });
    fixture = TestBed.createComponent(PendingListComponent);
    fixture.detectChanges();
  });

  it('muestra el botón y no llama al endpoint hasta que se pulsa', () => {
    expect(button().textContent).toContain('Leer los últimos correos');
    expect(emailService.triggerPolling).not.toHaveBeenCalled();
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

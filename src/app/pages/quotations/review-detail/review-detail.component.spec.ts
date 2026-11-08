import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReviewDetailComponent } from './review-detail.component';
import { environment } from '../../../../environments/environment';

describe('ReviewDetailComponent', () => {
  let component: ReviewDetailComponent;
  let httpMock: HttpTestingController;
  const rfqUrl = `${environment.apiUrl}/rfqs`;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  function createComponent(id = '42') {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ReviewDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ReviewDetailComponent);
    component = fixture.componentInstance;
    return fixture;
  }

  afterEach(() => {
    component.ngOnDestroy();
    httpMock.verify();
    routerSpy.navigate.calls.reset();
  });

  function flushRfq(status: string) {
    const req = httpMock.expectOne(`${rfqUrl}/42`);
    req.flush({
      success: true,
      data: { id: 42, status, items: [], clientName: 'Cliente', extractionConfidence: 0.9 },
    });
  }

  function flushStockCheck(status: 'PROCESSING' | 'DONE' | 'FAILED', extra: any = {}) {
    const req = httpMock.expectOne(`${rfqUrl}/42/stock-check`);
    req.flush({ success: true, data: { rfqId: 42, status, ...extra } });
  }

  it('al iniciar con RFQ PROCESSING, arranca el polling de stock-check', fakeAsync(() => {
    createComponent();
    component.ngOnInit();

    flushRfq('PROCESSING');
    flushStockCheck('PROCESSING');
    expect(component.isStockProcessing).toBeTrue();

    // el polling dispara una nueva llamada cada 3s
    tick(3000);
    flushStockCheck('PROCESSING');

    discardPeriodicIfPending();
  }));

  it('cuando el polling recibe status DONE, deja de sondear y recarga el RFQ', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    flushRfq('PROCESSING');
    flushStockCheck('PROCESSING');

    tick(3000);
    const stockReq = httpMock.expectOne(`${rfqUrl}/42/stock-check`);
    stockReq.flush({
      success: true,
      data: { rfqId: 42, status: 'DONE', items: [{ rfqItemId: 1, matched: true, unitPrice: 10 }] },
    });

    // status pasó de PROCESSING -> se recarga el RFQ una vez
    const rfqReq = httpMock.expectOne(`${rfqUrl}/42`);
    rfqReq.flush({ success: true, data: { id: 42, status: 'PENDING_REVIEW', items: [] } });

    expect(component.isStockDone).toBeTrue();
    expect(component.rfq?.status).toBe('PENDING_REVIEW');

    // ya no debe haber más llamadas de polling
    tick(3000);
    httpMock.expectNone(`${rfqUrl}/42/stock-check`);
  }));

  it('estado FAILED se refleja en isStockFailed y no arranca polling', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    flushRfq('PENDING_REVIEW');
    flushStockCheck('FAILED', { errorMessage: 'Gemini no disponible' });

    expect(component.isStockFailed).toBeTrue();

    tick(3000);
    httpMock.expectNone(`${rfqUrl}/42/stock-check`);
  }));

  it('refreshStockCheck() (botón reintentar) dispara una nueva llamada', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    flushRfq('PENDING_REVIEW');
    flushStockCheck('FAILED');

    component.refreshStockCheck();
    flushStockCheck('DONE', { items: [] });

    expect(component.isStockDone).toBeTrue();
  }));

  it('ngOnDestroy detiene el polling: tras destruir, tick(3000) no genera más peticiones', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    flushRfq('PROCESSING');
    flushStockCheck('PROCESSING');

    component.ngOnDestroy();

    tick(3000);
    expect(httpMock.match(`${rfqUrl}/42/stock-check`).length).toBe(0);
  }));

  it('approve() marca approving y carga la cotización generada al confirmar', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    flushRfq('PENDING_REVIEW');
    flushStockCheck('DONE', { items: [] });

    component.approve();
    expect(component.approving).toBeTrue();

    const confirmReq = httpMock.expectOne(`${rfqUrl}/42/confirm`);
    confirmReq.flush({ success: true, data: 99 });
    expect(component.approving).toBeFalse();

    const quotationReq = httpMock.expectOne(`${environment.apiUrl}/quotations/99`);
    quotationReq.flush({ success: true, data: { id: 99, quotationNumber: 'COT-2026-0099' } });

    expect(component.quotation?.quotationNumber).toBe('COT-2026-0099');
  }));

  it('reject() con confirmación marca rejecting y navega a /cotizaciones al terminar', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    createComponent();
    component.ngOnInit();
    flushRfq('PENDING_REVIEW');
    flushStockCheck('DONE', { items: [] });

    component.reject();
    expect(component.rejecting).toBeTrue();

    const req = httpMock.expectOne(`${rfqUrl}/42/reject`);
    req.flush({ success: true, data: 'REJECTED' });

    expect(component.rejecting).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cotizaciones']);
  }));

  it('reject() no llama al backend si el usuario cancela la confirmación', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(false);
    createComponent();
    component.ngOnInit();
    flushRfq('PENDING_REVIEW');
    flushStockCheck('DONE', { items: [] });

    component.reject();

    expect(httpMock.match(`${rfqUrl}/42/reject`).length).toBe(0);
    expect(component.rejecting).toBeFalse();
  }));

  function discardPeriodicIfPending(): void {
    // limpia el intervalo activo antes de que TestBed valide timers pendientes
    component.ngOnDestroy();
  }
});

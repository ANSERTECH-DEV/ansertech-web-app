import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RfqService } from './rfq.service';
import { environment } from '../../environments/environment';

describe('RfqService', () => {
  let service: RfqService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/rfqs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RfqService],
    });
    service = TestBed.inject(RfqService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getRfqs() sin status usa page/size por defecto y no envía status', () => {
    service.getRfqs().subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.has('status')).toBeFalse();
    req.flush({ success: true, data: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 } });
  });

  it('getRfqs("Todas") no envía status al backend', () => {
    service.getRfqs('Todas', 1, 10).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.has('status')).toBeFalse();
    req.flush({ success: true, data: {} });
  });

  const cases: [string, string][] = [
    ['Procesando', 'PROCESSING'],
    ['Por aprobar', 'PENDING_REVIEW'],
    ['Cotizando', 'QUOTING'],
    ['Cotizado', 'QUOTED'],
    ['Rechazado', 'REJECTED'],
  ];
  cases.forEach(([label, backendStatus]) => {
    it(`getRfqs("${label}") mapea a status=${backendStatus}`, () => {
      service.getRfqs(label).subscribe();
      const req = httpMock.expectOne(r => r.url === apiUrl);
      expect(req.request.params.get('status')).toBe(backendStatus);
      req.flush({ success: true, data: {} });
    });
  });

  it('getById() hace GET a /rfqs/{id}', () => {
    service.getById(42).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/42`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('confirm() hace POST a /rfqs/{id}/confirm con body vacío', () => {
    service.confirm(42).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/42/confirm`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: 1 });
  });

  it('reject() hace POST a /rfqs/{id}/reject con body vacío', () => {
    service.reject(42).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/42/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: 'REJECTED' });
  });

  it('stockCheck() hace GET a /rfqs/{id}/stock-check', () => {
    service.stockCheck(42).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/42/stock-check`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { rfqId: 42, status: 'PROCESSING' } });
  });
});

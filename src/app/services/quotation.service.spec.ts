import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuotationService } from './quotation.service';
import { environment } from '../../environments/environment';

describe('QuotationService', () => {
  let service: QuotationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/quotations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuotationService],
    });
    service = TestBed.inject(QuotationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getById() hace GET a /quotations/{id}', () => {
    service.getById(7).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 7, quotationNumber: 'COT-2026-0007' } });
  });

  it('el servicio no expone un método send() (POST /quotations/{id}/send) — hallazgo ya reportado, no implementado', () => {
    expect((service as any).send).toBeUndefined();
  });
});

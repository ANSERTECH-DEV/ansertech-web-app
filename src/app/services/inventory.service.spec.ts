import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { environment } from '../../environments/environment';
import { ProductRequest } from '../core/models/product.model';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/inventory`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryService],
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() usa page/size por defecto sin search ni category', () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('100');
    expect(req.request.params.has('search')).toBeFalse();
    expect(req.request.params.has('category')).toBeFalse();
    expect(req.request.params.has('sort')).toBeFalse();
    req.flush({ success: true, data: {} });
  });

  it('getAll() envía sort solo cuando se pasa', () => {
    service.getAll(0, 1000, undefined, undefined, 'name,asc').subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('size')).toBe('1000');
    expect(req.request.params.get('sort')).toBe('name,asc');
    req.flush({ success: true, data: {} });
  });

  it('getAll() incluye search y category cuando se pasan', () => {
    service.getAll(0, 20, 'sensor', 'analitico').subscribe();
    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.params.get('search')).toBe('sensor');
    expect(req.request.params.get('category')).toBe('analitico');
    req.flush({ success: true, data: {} });
  });

  it('getById() hace GET a /inventory/{id}', () => {
    service.getById(5).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('create() hace POST con el ProductRequest como body', () => {
    const body: ProductRequest = { sku: 'SKU-1', name: 'Sensor', stockQuantity: 10, unitPrice: 25.5 };
    service.create(body).subscribe();
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: {} });
  });

  it('update() hace PUT a /inventory/{id}', () => {
    const body: ProductRequest = { sku: 'SKU-1', name: 'Sensor', stockQuantity: 10, unitPrice: 25.5 };
    service.update(5, body).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: {} });
  });

  it('updateStock() hace PATCH a /inventory/{id}/stock con {quantity}', () => {
    service.updateStock(5, 30).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/5/stock`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 30 });
    req.flush({ success: true, data: {} });
  });

  it('getLowStock() hace GET a /inventory/low-stock', () => {
    service.getLowStock().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/low-stock`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('downloadTemplate() hace GET a /inventory/import/template como blob', () => {
    service.downloadTemplate().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/import/template`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['xlsx']));
  });

  it('importExcel() hace POST multipart a /inventory/import con el archivo y dryRun', () => {
    const file = new File(['xlsx'], 'inventario.xlsx');

    service.importExcel(file, true).subscribe();
    const preview = httpMock.expectOne(r => r.url === `${apiUrl}/import`);
    expect(preview.request.method).toBe('POST');
    expect(preview.request.params.get('dryRun')).toBe('true');
    expect(preview.request.body instanceof FormData).toBeTrue();
    expect((preview.request.body as FormData).get('file')).toEqual(file);
    preview.flush({ success: true, data: {} });

    service.importExcel(file, false).subscribe();
    const commit = httpMock.expectOne(r => r.url === `${apiUrl}/import`);
    expect(commit.request.params.get('dryRun')).toBe('false');
    commit.flush({ success: true, data: {} });
  });
});

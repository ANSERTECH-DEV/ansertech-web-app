import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { ProductResponse, ProductRequest, ImportResult } from '../core/models/product.model';
import { Page } from '../core/models/rfq.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 100, search?: string, category?: string, sort?: string): Observable<ApiResponse<Page<ProductResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search)   params = params.set('search', search);
    if (category) params = params.set('category', category);
    if (sort)     params = params.set('sort', sort);   // p. ej. 'name,asc' (Spring Data)
    return this.http.get<ApiResponse<Page<ProductResponse>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`);
  }

  create(req: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(this.apiUrl, req);
  }

  update(id: number, req: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.put<ApiResponse<ProductResponse>>(`${this.apiUrl}/${id}`, req);
  }

  updateStock(id: number, quantity: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.patch<ApiResponse<ProductResponse>>(`${this.apiUrl}/${id}/stock`, { quantity });
  }

  getLowStock(): Observable<ApiResponse<ProductResponse[]>> {
    return this.http.get<ApiResponse<ProductResponse[]>>(`${this.apiUrl}/low-stock`);
  }

  /** Plantilla Excel vacía (hoja Inventario + Instrucciones) para la carga masiva. */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/import/template`, { responseType: 'blob' });
  }

  /** Carga masiva desde Excel. dryRun = true solo previsualiza (no guarda nada). */
  importExcel(file: File, dryRun: boolean): Observable<ApiResponse<ImportResult>> {
    const form = new FormData();
    form.append('file', file);
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.post<ApiResponse<ImportResult>>(`${this.apiUrl}/import`, form, { params });
  }
}

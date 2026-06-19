import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { ProductResponse, ProductRequest } from '../core/models/product.model';
import { Page } from '../core/models/rfq.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 100, search?: string, category?: string): Observable<ApiResponse<Page<ProductResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search)   params = params.set('search', search);
    if (category) params = params.set('category', category);
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
}

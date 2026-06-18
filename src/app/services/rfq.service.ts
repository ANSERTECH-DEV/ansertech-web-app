import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { RfqResponse, Page, StockCheckItem } from '../core/models/rfq.model';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private apiUrl = `${environment.apiUrl}/rfqs`;

  constructor(private http: HttpClient) {}

  getRfqs(status?: string, page: number = 0, size: number = 20): Observable<ApiResponse<Page<RfqResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (status && status !== 'Todas') {
      let backendStatus = '';
      if (status === 'Por aprobar') backendStatus = 'PENDING_REVIEW';
      else if (status === 'En proceso') backendStatus = 'IN_PROGRESS';
      
      if (backendStatus) {
         params = params.set('status', backendStatus);
      }
    }

    return this.http.get<ApiResponse<Page<RfqResponse>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<RfqResponse>> {
    return this.http.get<ApiResponse<RfqResponse>>(`${this.apiUrl}/${id}`);
  }

  confirm(id: number): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/${id}/confirm`, {});
  }

  reject(id: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/${id}/reject`, {});
  }

  stockCheck(id: number): Observable<ApiResponse<StockCheckItem[]>> {
    return this.http.get<ApiResponse<StockCheckItem[]>>(`${this.apiUrl}/${id}/stock-check`);
  }
}

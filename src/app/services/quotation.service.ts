import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { QuotationResponse } from '../core/models/quotation.model';

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private apiUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<ApiResponse<QuotationResponse>> {
    return this.http.get<ApiResponse<QuotationResponse>>(`${this.apiUrl}/${id}`);
  }
}

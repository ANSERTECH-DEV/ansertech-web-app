import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { DashboardKpisResponse } from '../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /** Fechas en formato yyyy-MM-dd, ambas inclusive. */
  getKpis(from: string, to: string): Observable<ApiResponse<DashboardKpisResponse>> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ApiResponse<DashboardKpisResponse>>(`${this.apiUrl}/kpis`, { params });
  }
}

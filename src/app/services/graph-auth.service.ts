import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { GraphConnection } from '../core/models/graph.model';

/** Vinculación de Outlook (Microsoft Graph) y log del backend. Endpoints solo para ADMIN. */
@Injectable({ providedIn: 'root' })
export class GraphAuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatus(): Observable<ApiResponse<GraphConnection>> {
    return this.http.get<ApiResponse<GraphConnection>>(`${this.apiUrl}/auth/graph/device-code`);
  }

  getLogs(lines = 50): Observable<string> {
    const params = new HttpParams().set('lines', lines);
    return this.http.get(`${this.apiUrl}/admin/logs`, { params, responseType: 'text' });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { Parameter } from '../core/models/parameter.model';

@Injectable({ providedIn: 'root' })
export class ParameterService {
  private apiUrl = `${environment.apiUrl}/parameters`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Parameter[]>> {
    return this.http.get<ApiResponse<Parameter[]>>(this.apiUrl);
  }

  /** Cantidad de correos que leerá el polling manual (valor efectivo del parámetro "Cantidad de correos"). */
  getEmailCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/email-count`);
  }

  updateValue(id: number, value: string): Observable<ApiResponse<Parameter>> {
    return this.http.patch<ApiResponse<Parameter>>(`${this.apiUrl}/${id}`, { value });
  }
}

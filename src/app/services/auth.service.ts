import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../core/models/auth.model';
import { ApiResponse } from '../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ansertech_token';
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest) {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA");
    
    return this.http.post(`${this.apiUrl}/login`,request);

    // return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request)
    //   .pipe(map(response => {
    //     if (response.success && response.data.token) {
    //       this.saveToken(response.data.token);
    //     }
    //     return response.data;
    //   }));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, request)
      .pipe(map(response => {
        if (response.success && response.data.token) {
          this.saveToken(response.data.token);
        }
        return response.data;
      }));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

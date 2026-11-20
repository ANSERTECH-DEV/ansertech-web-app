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
  private readonly USER_KEY = 'ansertech_user';
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /** Solo hace la petición; quien llama decide si guarda el token (ver AuthComponent). */
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request);
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
    localStorage.removeItem(this.USER_KEY);
  }

  /** Guarda nombre, correo y rol del usuario que inició sesión (para la barra superior). */
  saveUser(user: Pick<AuthResponse, 'fullName' | 'email' | 'role'>): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify({ fullName: user.fullName, email: user.email, role: user.role }));
  }

  /**
   * Usuario de la sesión actual. Si la sesión es anterior a este cambio (no hay usuario guardado),
   * usa el correo del JWT (claim "sub") como respaldo.
   */
  getUser(): { fullName: string | null; email: string | null; role: string | null } | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        return { fullName: u.fullName || null, email: u.email || null, role: u.role || null };
      }
    } catch { /* valor corrupto: se ignora */ }
    const email = this.emailFromToken();
    return email ? { fullName: null, email, role: null } : null;
  }

  private emailFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).sub ?? null;
    } catch {
      return null;
    }
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

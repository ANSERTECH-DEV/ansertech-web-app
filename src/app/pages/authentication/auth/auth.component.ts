import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export const LOGIN_ERRORS = {
  invalidCredentials: 'Correo o contraseña incorrectos.',
  network: 'No se pudo conectar con el servidor. Intenta nuevamente.',
  generic: 'Ocurrió un error al iniciar sesión. Intenta nuevamente.'
};

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        const token = res?.success ? res.data?.token : null;
        if (!token) {
          this.errorMessage = res?.message || LOGIN_ERRORS.generic;
          return;
        }
        this.authService.saveToken(token);
        this.authService.saveUser(res.data);
        this.router.navigate(['/cotizaciones']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.toMessage(err);
      }
    });
  }

  /** Borra el aviso cuando el usuario corrige el correo o la contraseña. */
  clearError(): void {
    this.errorMessage = '';
  }

  private toMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return LOGIN_ERRORS.network;
    }
    if (err.status === 401) {
      // "Credenciales inválidas" se reemplaza por un texto más claro; otros 401 (p. ej. usuario inactivo) se muestran tal cual.
      const backend: string | undefined = err.error?.message;
      return backend && backend !== 'Credenciales inválidas' ? backend : LOGIN_ERRORS.invalidCredentials;
    }
    return LOGIN_ERRORS.generic;
  }
}

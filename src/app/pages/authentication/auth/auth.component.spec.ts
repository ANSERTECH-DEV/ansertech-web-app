import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AuthComponent, LOGIN_ERRORS } from './auth.component';
import { AuthService } from '../../../services/auth.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthResponse } from '../../../core/models/auth.model';

describe('AuthComponent', () => {
  let fixture: ComponentFixture<AuthComponent>;
  let component: AuthComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const alertText = (): string | null =>
    fixture.nativeElement.querySelector('[role="alert"]')?.textContent.trim() ?? null;
  const submitButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button[type="submit"]');
  const httpError = (status: number, message?: string) =>
    throwError(() => new HttpErrorResponse({ status, error: message ? { success: false, message } : null }));

  const submit = () => {
    component.email = 'operador@ansertech.pe';
    component.password = 'clave-incorrecta';
    component.onSubmit();
    fixture.detectChanges();
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'saveToken', 'saveUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('no muestra ningún aviso al abrir la pantalla', () => {
    expect(alertText()).toBeNull();
  });

  it('con credenciales incorrectas (401) avisa, no guarda token y no navega', () => {
    authService.login.and.returnValue(httpError(401, 'Credenciales inválidas'));

    submit();

    expect(alertText()).toBe(LOGIN_ERRORS.invalidCredentials);
    expect(authService.saveToken).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Acceso al sistema');
  });

  it('muestra el aviso en cada intento fallido', () => {
    authService.login.and.returnValue(httpError(401, 'Credenciales inválidas'));

    submit();
    submit();

    expect(authService.login).toHaveBeenCalledTimes(2);
    expect(alertText()).toBe(LOGIN_ERRORS.invalidCredentials);
  });

  it('muestra el mensaje del backend para un usuario inactivo', () => {
    authService.login.and.returnValue(httpError(401, 'Usuario inactivo. Contacta al administrador.'));

    submit();

    expect(alertText()).toBe('Usuario inactivo. Contacta al administrador.');
  });

  it('avisa si no hay conexión con el servidor (status 0)', () => {
    authService.login.and.returnValue(httpError(0));

    submit();

    expect(alertText()).toBe(LOGIN_ERRORS.network);
  });

  it('muestra un aviso genérico ante otros errores (500)', () => {
    authService.login.and.returnValue(httpError(500, 'Error interno del servidor'));

    submit();

    expect(alertText()).toBe(LOGIN_ERRORS.generic);
  });

  it('con credenciales correctas guarda el token y navega a cotizaciones', () => {
    const ok: ApiResponse<AuthResponse> = {
      success: true, message: 'Login exitoso',
      data: { token: 'jwt-123', email: 'operador@ansertech.pe', fullName: 'Operador', role: 'OPERATOR', expiresIn: 28800 }
    };
    authService.login.and.returnValue(of(ok));

    submit();

    expect(authService.saveToken).toHaveBeenCalledWith('jwt-123');
    expect(authService.saveUser).toHaveBeenCalledWith(ok.data);
    expect(router.navigate).toHaveBeenCalledWith(['/cotizaciones']);
    expect(alertText()).toBeNull();
  });

  it('no navega si la respuesta llega sin token', () => {
    authService.login.and.returnValue(of({ success: false, message: '', data: null as unknown as AuthResponse }));

    submit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(alertText()).toBe(LOGIN_ERRORS.generic);
  });

  it('deshabilita el botón mientras espera la respuesta', () => {
    const pending = new Subject<ApiResponse<AuthResponse>>();
    authService.login.and.returnValue(pending.asObservable());

    submit();
    expect(submitButton().disabled).toBeTrue();
    expect(submitButton().textContent).toContain('Ingresando');

    component.onSubmit(); // un segundo clic no repite la petición
    expect(authService.login).toHaveBeenCalledTimes(1);

    pending.error(new HttpErrorResponse({ status: 401 }));
    fixture.detectChanges();
    expect(submitButton().disabled).toBeFalse();
  });

  it('borra el aviso cuando el usuario vuelve a escribir', async () => {
    await fixture.whenStable(); // ngModel dentro de <form> se registra de forma asíncrona
    authService.login.and.returnValue(httpError(401, 'Credenciales inválidas'));
    submit();
    expect(alertText()).not.toBeNull();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[name="password"]');
    input.value = 'otra';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(alertText()).toBeNull();
  });
});

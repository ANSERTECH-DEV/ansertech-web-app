import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { AuthResponse, RegisterRequest } from '../core/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('ansertech_token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('ansertech_token');
  });

  it('login() hace POST a /auth/login con el body correcto', () => {
    service.login({ email: 'admin@ansertech.pe', password: 'admin123' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@ansertech.pe', password: 'admin123' });
    req.flush({ success: true, data: { token: 'abc' } });
  });

  it('login() NO guarda el token automáticamente (comportamiento actual: sin map/saveToken)', () => {
    service.login({ email: 'admin@ansertech.pe', password: 'admin123' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    req.flush({ success: true, data: { token: 'un-token-cualquiera' } });

    expect(localStorage.getItem('ansertech_token')).toBeNull();
  });

  it('register() hace POST a /auth/register y guarda el token cuando success=true', () => {
    const request: RegisterRequest = {
      fullName: 'Nuevo Operador', email: 'nuevo@ansertech.pe', password: 'pass123', role: 'OPERATOR',
    };
    let result: AuthResponse | undefined;
    service.register(request).subscribe(r => (result = r));

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: 'Login exitoso',
      data: { token: 'jwt-token-123', email: request.email, fullName: request.fullName, role: 'OPERATOR', expiresIn: 28800 },
    };
    req.flush(response);

    expect(localStorage.getItem('ansertech_token')).toBe('jwt-token-123');
    expect(result?.email).toBe(request.email);
  });

  it('register() NO guarda token si success=false', () => {
    service.register({ fullName: 'X', email: 'x@x.pe', password: 'x', role: 'OPERATOR' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/register`);
    req.flush({ success: false, message: 'correo ya registrado' });

    expect(localStorage.getItem('ansertech_token')).toBeNull();
  });

  it('saveToken()/getToken() usan localStorage con la clave ansertech_token', () => {
    service.saveToken('mi-token');
    expect(localStorage.getItem('ansertech_token')).toBe('mi-token');
    expect(service.getToken()).toBe('mi-token');
  });

  it('logout() elimina el token', () => {
    service.saveToken('mi-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  it('isAuthenticated() refleja la presencia del token', () => {
    expect(service.isAuthenticated()).toBeFalse();
    service.saveToken('mi-token');
    expect(service.isAuthenticated()).toBeTrue();
  });
});

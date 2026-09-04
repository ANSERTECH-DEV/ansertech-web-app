import { TestBed } from '@angular/core/testing';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../../services/auth.service';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('agrega Authorization: Bearer <token> cuando hay token y la URL es /api/', () => {
    spyOn(authService, 'getToken').and.returnValue('mi-jwt');

    http.get('http://localhost:8080/api/rfqs').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/rfqs');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-jwt');
    req.flush({});
  });

  it('NO agrega el header si no hay token', () => {
    spyOn(authService, 'getToken').and.returnValue(null);

    http.get('http://localhost:8080/api/rfqs').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/rfqs');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('NO agrega el header si la URL no contiene /api/', () => {
    spyOn(authService, 'getToken').and.returnValue('mi-jwt');

    http.get('http://localhost:8080/assets/logo.png').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/assets/logo.png');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MenuComponent } from './menu.component';
import { AuthService } from '../../services/auth.service';

describe('MenuComponent (usuario arriba a la derecha)', () => {
  let fixture: ComponentFixture<MenuComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  function create(user: ReturnType<AuthService['getUser']>) {
    authService = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
    authService.getUser.and.returnValue(user);
    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      schemas: [NO_ERRORS_SCHEMA],   // p-toolbar no hace falta para este test
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });
    fixture = TestBed.createComponent(MenuComponent);
    return fixture.componentInstance;
  }

  it('muestra el full_name del usuario y sus iniciales (ya no "Juan Reyes")', () => {
    const c = create({ fullName: 'Rony Piero Ticona Luque', email: 'piero@ansertech.pe', role: 'ADMIN' });
    expect(c.displayName).toBe('Rony Piero Ticona Luque');
    expect(c.initials).toBe('RL');
  });

  it('sin full_name (sesión anterior) muestra el correo', () => {
    const c = create({ fullName: null, email: 'g.quillaluyo@gmail.com', role: null });
    expect(c.displayName).toBe('g.quillaluyo@gmail.com');
    expect(c.initials).toBe('G');
  });

  it('sin usuario muestra "Usuario"', () => {
    const c = create(null);
    expect(c.displayName).toBe('Usuario');
    expect(c.initials).toBe('U');
  });

  it('el nombre de una sola palabra usa una inicial', () => {
    expect(MenuComponent.toInitials('Administrador')).toBe('A');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { UsuarioSesion } from '../models';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('restores the authenticated user from the session endpoint', () => {
    const usuario: UsuarioSesion = { IdUsuario: 4, Nombre: 'Alex', Usuario: 'alex' };
    let resultado: UsuarioSesion | null = null;

    authService.checkSession().subscribe((user) => {
      resultado = user;
    });

    const request = httpTestingController.expectOne('http://localhost:8080/v1/session');
    expect(request.request.withCredentials).toBe(true);
    request.flush(usuario);

    expect(resultado).toEqual(usuario);
    expect(authService.isAuthenticated).toBe(true);
  });

  it('keeps session-check failures visible and unauthenticated', () => {
    let resultado: UsuarioSesion | null = { IdUsuario: 4, Nombre: 'Alex', Usuario: 'alex' };

    authService.checkSession().subscribe((user) => {
      resultado = user;
    });

    httpTestingController.expectOne('http://localhost:8080/v1/session').flush('No disponible', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(resultado).toBeNull();
    expect(authService.isAuthenticated).toBe(false);
    expect(authService.sessionError).toBeTruthy();
  });

  it('clears the authenticated user after a successful logout', () => {
    const usuario: UsuarioSesion = { IdUsuario: 4, Nombre: 'Alex', Usuario: 'alex' };
    authService.login({ Usuario: 'alex', Clave: 'secret' }).subscribe();
    httpTestingController.expectOne('http://localhost:8080/v1/login').flush(usuario);
    expect(authService.isAuthenticated).toBe(true);

    authService.logout().subscribe();
    const request = httpTestingController.expectOne('http://localhost:8080/v1/logout');
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);

    expect(authService.isAuthenticated).toBe(false);
  });
});

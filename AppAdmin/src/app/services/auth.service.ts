import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

import type { UsuarioSesion } from '../models';
import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly userSubject = new BehaviorSubject<UsuarioSesion | null>(null);

  readonly user$ = this.userSubject.asObservable();
  sessionError: string | null = null;

  /** Solo los administradores pueden entrar en AppAdmin. */
  get isAdmin(): boolean {
    return this.userSubject.value?.EsAdmin === true;
  }

  checkSession(): Observable<UsuarioSesion | null> {
    return this.apiService.getSession().pipe(
      tap((user) => {
        this.sessionError = null;
        this.userSubject.next(user);
      }),
      catchError((error: unknown) => {
        this.sessionError = this.getErrorMessage(error);
        this.userSubject.next(null);
        return of(null);
      }),
    );
  }

  login(credentials: { Usuario: string; Clave: string }): Observable<UsuarioSesion> {
    return this.apiService.login(credentials).pipe(
      tap((user) => {
        this.sessionError = null;
        this.userSubject.next(user);
      }),
    );
  }

  logout(): Observable<void> {
    return this.apiService.logout().pipe(
      tap(() => this.userSubject.next(null)),
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status !== 0) {
      return 'No se pudo comprobar la sesión.';
    }
    return 'No se pudo conectar con el servidor.';
  }
}

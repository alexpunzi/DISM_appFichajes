import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';

import type { UsuarioSesion } from '../models';

import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly userSubject = new BehaviorSubject<UsuarioSesion | null>(null);

  readonly user$ = this.userSubject.asObservable();
  sessionError: string | null = null;

  get isAuthenticated(): boolean {
    return this.userSubject.value !== null;
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
      tap(() => {
        this.userSubject.next(null);
      }),
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.message || 'No se pudo comprobar la sesión.';
    }
    return 'No se pudo comprobar la sesión.';
  }
}

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonTitle,
    IonToolbar,
  ],
})
export class LoginPage {
  usuario = '';
  clave = '';
  mensajeError: string | null = null;
  cargando = false;

  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.mensajeError = this.authService.sessionError;
    if (this.authService.isAuthenticated) {
      void this.router.navigateByUrl(this.getReturnUrl());
    }
  }

  iniciarSesion(): void {
    if (this.cargando || !this.usuario.trim() || !this.clave) {
      return;
    }

    this.cargando = true;
    this.mensajeError = null;
    this.authService.login({ Usuario: this.usuario.trim(), Clave: this.clave }).subscribe({
      next: () => {
        this.cargando = false;
        void this.router.navigateByUrl(this.getReturnUrl());
      },
      error: (error: unknown) => {
        this.cargando = false;
        this.mensajeError =
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
      },
    });
  }

  comprobarSesion(): void {
    this.authService.checkSession().subscribe((user) => {
      if (user) {
        void this.router.navigateByUrl(this.getReturnUrl());
      } else {
        this.mensajeError = this.authService.sessionError;
      }
    });
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') && returnUrl !== '/login' ? returnUrl : '/home';
  }
}

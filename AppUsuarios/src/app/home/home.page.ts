import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, listOutline, logOutOutline, timeOutline } from 'ionicons/icons';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    AsyncPipe,
    RouterLink,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonRow,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class HomePage {
  toastAbierto = false;
  toastMensaje = '';

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ arrowForwardOutline, listOutline, logOutOutline, timeOutline });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: (error: unknown) => {
        console.error('Error al cerrar sesión:', error);
        this.toastMensaje = 'No se pudo cerrar la sesión.';
        this.toastAbierto = true;
      },
    });
  }
}

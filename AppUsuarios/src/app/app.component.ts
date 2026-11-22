import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, listOutline, logOutOutline, timeOutline } from 'ionicons/icons';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonSplitPane,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ homeOutline, listOutline, logOutOutline, timeOutline });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: (error: unknown) => console.error('Error al cerrar sesión:', error),
    });
  }
}
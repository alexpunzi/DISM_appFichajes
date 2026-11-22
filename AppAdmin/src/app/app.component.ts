/*
 * ============================================================================
 * DISM - Práctica 1: AppAdmin
 * Archivo: app.component.ts
 * Descripción: Componente principal con barra/menú lateral e importación de iconos.
 * ============================================================================
 */

import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { 
  IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonRouterOutlet 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, peopleOutline, briefcaseOutline, timeOutline, logOutOutline } from 'ionicons/icons';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterModule, IonApp, IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, IonRouterOutlet
  ],
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Registrar iconos que usaremos en el menú lateral
    addIcons({ homeOutline, peopleOutline, briefcaseOutline, timeOutline, logOutOutline });
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: (error: unknown) => console.error('Error al cerrar sesión:', error),
    });
  }
}
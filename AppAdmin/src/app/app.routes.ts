import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'gestionusuarios',
    loadComponent: () => import('./gestionusuarios/gestionusuarios.page').then((m) => m.GestionusuariosPage),
    canActivate: [authGuard],
  },
  {
    path: 'gestiontrabajos',
    loadComponent: () => import('./gestiontrabajos/gestiontrabajos.page').then((m) => m.GestiontrabajosPage),
    canActivate: [authGuard],
  },
  {
    path: 'gestionfichajes',
    loadComponent: () => import('./gestionfichajes/gestionfichajes.page').then((m) => m.GestionfichajesPage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

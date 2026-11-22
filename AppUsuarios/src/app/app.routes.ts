import type { Routes } from '@angular/router';

import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'registro-fichaje',
    loadComponent: () => import('./registro-fichaje/registro-fichaje.page').then((m) => m.RegistroFichajePage),
    canActivate: [authGuard],
  },
  {
    path: 'consulta-fichajes',
    loadComponent: () => import('./consulta-fichajes/consulta-fichajes.page').then((m) => m.ConsultaFichajesPage),
    canActivate: [authGuard],
  },
];

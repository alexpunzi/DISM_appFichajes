import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'registro-fichaje',
    loadComponent: () => import('./registro-fichaje/registro-fichaje.page').then((m) => m.RegistroFichajePage),
  },
  {
    path: 'consulta-fichajes',
    loadComponent: () => import('./consulta-fichajes/consulta-fichajes.page').then((m) => m.ConsultaFichajesPage),
  },
];

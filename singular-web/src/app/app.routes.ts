import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { inverseAuthGuard } from './core/guards/inverse-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [inverseAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [inverseAuthGuard],
  },

  {
    path: ':id',
    loadComponent: () => import('./layout/root/root.component').then((m) => m.RootComponent),
    canActivate: [authGuard],
  },

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards';
import { inverseAuthGuard } from './core/guards/inverse-auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  },
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
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.compontent').then((m) => m.HomeComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./pages/edit-personal-info/edit-personal-info.component').then(
            (m) => m.EditPersonalInfoComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

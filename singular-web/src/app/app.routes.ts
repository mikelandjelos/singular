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
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [inverseAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [inverseAuthGuard],
  },
  {
    path: ':userId',
    loadComponent: () => import('./core/layout/root/root.component').then((m) => m.RootComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/user/home/home.compontent').then((m) => m.HomeComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./features/user/edit-personal-info/edit-personal-info.component').then(
            (m) => m.EditPersonalInfoComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];

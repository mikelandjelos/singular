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
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'notes',
        loadComponent: () =>
          import('./features/note/home/notes-home.component').then((m) => m.NotesHomeComponent),
      },
      {
        path: 'notes/:id/edit',
        loadComponent: () =>
          import('./features/note/edit/note-edit.component').then((m) => m.NoteEditComponent),
        canDeactivate: [
          () =>
            import('./features/note/guards/pending-changes.guard').then(
              (m) => m.PendingChangesGuard,
            ),
        ],
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
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/project/projects-page/projects-page.component').then(
            (m) => m.ProjectsPageComponent,
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

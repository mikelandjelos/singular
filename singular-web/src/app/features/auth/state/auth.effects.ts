import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.actions';
import { AuthService, ToastService } from '../../../core/services';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
  private actions$ = inject(Actions);
  private api = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ loginParams }) =>
        this.api.login(loginParams).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user })),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err?.error?.message ?? 'Login failed' })),
          ),
        ),
      ),
    ),
  );

  onLoginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          this.toast.success(`Welcome back, ${user.displayName || user.email}!`);
          this.router.navigateByUrl(`/${user.id}`);
        }),
      ),
    { dispatch: false },
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ registerParams }) =>
        this.api.register(registerParams).pipe(
          map(() => AuthActions.registerSuccess()),
          catchError((err) =>
            of(
              AuthActions.registerFailure({ error: err?.error?.message ?? 'Registration failed' }),
            ),
          ),
        ),
      ),
    ),
  );

  onRegisterSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          this.router.navigate(['/login']);
          this.toast.success('Account created! Please log in.');
        }),
      ),
    { dispatch: false },
  );

  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMe),
      mergeMap(() =>
        this.api.me().pipe(
          map((user) => AuthActions.loadMeSuccess({ user })),
          catchError((err) =>
            of(AuthActions.loadMeFailure({ error: err?.error?.message ?? 'Unauthorized' })),
          ),
        ),
      ),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.api.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((err) =>
            of(AuthActions.logoutFailure({ error: err?.error?.message ?? 'Logout failed' })),
          ),
        ),
      ),
    ),
  );

  onLogoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.toast.show('Signed out');
          this.router.navigateByUrl('/login');
        }),
      ),
    { dispatch: false },
  );

  authFailuresToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.logoutFailure),
        tap(({ error }) => this.toast.error(error || 'Something went wrong')),
      ),
    { dispatch: false },
  );
}

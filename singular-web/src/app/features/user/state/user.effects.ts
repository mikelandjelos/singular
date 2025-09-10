import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserActions } from './user.actions';
import { UserService, ToastService } from '../../../core/services';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { AuthActions } from '../../auth/state';

@Injectable({ providedIn: 'root' })
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.update),
      mergeMap(({ id, changes }) =>
        this.userService.update(id, changes).pipe(
          map((user) => UserActions.updateSuccess({ user })),
          catchError((err) =>
            of(UserActions.updateFailure({ error: err?.error?.message ?? 'Update failed' })),
          ),
        ),
      ),
    ),
  );

  onUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.updateSuccess),
        tap(() => this.toast.success('Profile updated')),
      ),
    { dispatch: false },
  );

  mirrorUpdateToAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateSuccess),
      map(({ user }) => AuthActions.loadMeSuccess({ user })),
    ),
  );

  softDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.softDelete),
      mergeMap(({ id }) =>
        this.userService.softDelete(id).pipe(
          map(() => UserActions.softDeleteSuccess()),
          catchError((err) =>
            of(UserActions.softDeleteFailure({ error: err?.error?.message ?? 'Archive failed' })),
          ),
        ),
      ),
    ),
  );

  toastOnSoftDelete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.softDeleteSuccess),
        tap(() => this.toast.show('Account archived')),
      ),
    { dispatch: false },
  );

  reloadAfterSoftDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.softDeleteSuccess),
      map(() => AuthActions.loadMe()),
    ),
  );

  restore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.restore),
      mergeMap(({ id }) =>
        this.userService.restore(id).pipe(
          map(() => UserActions.restoreSuccess()),
          catchError((err) =>
            of(UserActions.restoreFailure({ error: err?.error?.message ?? 'Restore failed' })),
          ),
        ),
      ),
    ),
  );

  toastOnRestore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.restoreSuccess),
        tap(() => this.toast.success('Account restored')),
      ),
    { dispatch: false },
  );

  reloadAfterRestore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.restoreSuccess),
      map(() => AuthActions.loadMe()),
    ),
  );

  hardDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.hardDelete),
      mergeMap(({ id }) =>
        this.userService.hardDelete(id).pipe(
          map(() => UserActions.hardDeleteSuccess()),
          catchError((err) =>
            of(
              UserActions.hardDeleteFailure({
                error: err?.error?.message ?? 'Hard delete failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  onHardDeleteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.hardDeleteSuccess),
      map(() => AuthActions.logout()),
    ),
  );

  userFailuresToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          UserActions.updateFailure,
          UserActions.softDeleteFailure,
          UserActions.restoreFailure,
          UserActions.hardDeleteFailure,
        ),
        tap(({ error }) => this.toast.error(error || 'Something went wrong')),
      ),
    { dispatch: false },
  );
}

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { take, tap } from 'rxjs';
import { AuthActions, selectIsAuthed } from '../../auth/state';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  store.dispatch(AuthActions.loadMe());

  return store.select(selectIsAuthed).pipe(
    tap((isAuthed) => {
      if (!isAuthed) {
        router.navigate(['/login']);
      }
    }),
    take(1),
  );
};

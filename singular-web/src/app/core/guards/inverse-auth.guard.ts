import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, take, tap, combineLatest, filter } from 'rxjs';
import { selectAuthLoading, selectAuthUser } from '../../features/auth/state';

export const inverseAuthGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([store.select(selectAuthUser), store.select(selectAuthLoading)]).pipe(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter(([user, loading]) => !loading),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map(([user, loading]) => user),
    tap((user) => {
      if (user) {
        router.navigateByUrl(`/${user.id}`);
      }
    }),
    map((user) => !user),
    take(1),
  );
};

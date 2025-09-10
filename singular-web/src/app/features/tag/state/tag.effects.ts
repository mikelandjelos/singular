import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TagService } from '../../../core/services';
import { ToastService } from '../../../core/services';
import { TagActions } from './tag.actions';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TagEffects {
  private actions$ = inject(Actions);
  private tagService = inject(TagService);
  private toast = inject(ToastService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.load),
      debounceTime(300),
      switchMap(({ q }) =>
        this.tagService.list({ q, limit: 100 }).pipe(
          map((resp) => TagActions.loadSuccess({ resp })),
          catchError((err) =>
            of(TagActions.loadFailure({ error: err?.error?.message ?? 'Load tags failed' })),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.create),
      switchMap(({ dto }) =>
        this.tagService.create(dto).pipe(
          map((tag) => TagActions.createSuccess({ tag })),
          catchError((err) =>
            of(TagActions.createFailure({ error: err?.error?.message ?? 'Create tag failed' })),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.update),
      switchMap(({ id, dto }) =>
        this.tagService.update(id, dto).pipe(
          map((tag) => TagActions.updateSuccess({ tag })),
          catchError((err) =>
            of(TagActions.updateFailure({ error: err?.error?.message ?? 'Update tag failed' })),
          ),
        ),
      ),
    ),
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TagActions.delete),
      switchMap(({ id }) =>
        this.tagService.delete(id).pipe(
          map(() => TagActions.deleteSuccess({ id })),
          catchError((err) =>
            of(TagActions.deleteFailure({ error: err?.error?.message ?? 'Delete tag failed' })),
          ),
        ),
      ),
    ),
  );

  failuresToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          TagActions.loadFailure,
          TagActions.createFailure,
          TagActions.updateFailure,
          TagActions.deleteFailure,
        ),
        tap(({ error }) => this.toast.error(error || 'Something went wrong')),
      ),
    { dispatch: false },
  );
}

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { NoteService } from '../../../core/services/';
import { ToastService } from '../../../core/services';
import { NoteActions } from './note.actions';
import {
  selectArchivedOnly,
  selectPaging,
  selectQuery,
  selectSelectedProjectIds,
  selectSelectedTagIds,
} from './note.selectors';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  withLatestFrom,
  tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NoteEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private noteService = inject(NoteService);
  private toast = inject(ToastService);
  private router = inject(Router);

  reloadOnQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.setQuery),
      map(({ q }) => (q ?? '').trim()),
      debounceTime(1000),
      distinctUntilChanged(),
      map(() => NoteActions.loadPage()),
    ),
  );

  reloadOnParams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NoteActions.setArchivedOnly,
        NoteActions.toggleTagFilter,
        NoteActions.toggleProjectFilter,
        NoteActions.clearFilters,
        NoteActions.setPaging,
      ),
      map(() => NoteActions.loadPage()),
    ),
  );

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.loadPage),
      withLatestFrom(
        this.store.select(selectQuery),
        this.store.select(selectSelectedProjectIds),
        this.store.select(selectSelectedTagIds),
        this.store.select(selectPaging),
        this.store.select(selectArchivedOnly),
      ),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(([_, q, projectIds, tagIds, { offset, limit }, archived]) =>
        this.noteService.list({ q, projectIds, tagIds, offset, limit, archived }).pipe(
          map((resp) => NoteActions.loadPageSuccess({ resp })),
          catchError((err) =>
            of(NoteActions.loadPageFailure({ error: err?.error?.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.create),
      switchMap(({ dto }) =>
        this.noteService.create(dto).pipe(
          map((note) => NoteActions.createSuccess({ note })),
          catchError((err) =>
            of(NoteActions.createFailure({ error: err?.error?.message ?? 'Create failed' })),
          ),
        ),
      ),
    ),
  );

  onCreateSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NoteActions.createSuccess),
        tap(({ note }) => {
          const seg = this.router.url.split('/').filter(Boolean)[0] || '';
          this.router.navigate(['/', seg, 'notes', note.id, 'edit']);
          this.toast.success('Note created');
        }),
      ),
    { dispatch: false },
  );

  // Update
  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.update),
      switchMap(({ id, dto }) =>
        this.noteService.update(id, dto).pipe(
          map((note) => NoteActions.updateSuccess({ note })),
          catchError((err) =>
            of(NoteActions.updateFailure({ error: err?.error?.message ?? 'Update failed' })),
          ),
        ),
      ),
    ),
  );

  onUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NoteActions.updateSuccess),
        tap(() => this.toast.success('Note saved')),
      ),
    { dispatch: false },
  );

  softDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.softDelete),
      switchMap(({ id }) =>
        this.noteService.softDelete(id).pipe(
          map(() => NoteActions.softDeleteSuccess({ id })),
          catchError((err) =>
            of(NoteActions.softDeleteFailure({ error: err?.error?.message ?? 'Archive failed' })),
          ),
        ),
      ),
    ),
  );

  restore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.restore),
      switchMap(({ id }) =>
        this.noteService.restore(id).pipe(
          map(() => NoteActions.restoreSuccess({ id })),
          catchError((err) =>
            of(NoteActions.restoreFailure({ error: err?.error?.message ?? 'Restore failed' })),
          ),
        ),
      ),
    ),
  );

  hardDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NoteActions.hardDelete),
      switchMap(({ id }) =>
        this.noteService.hardDelete(id).pipe(
          map(() => NoteActions.hardDeleteSuccess({ id })),
          catchError((err) =>
            of(NoteActions.hardDeleteFailure({ error: err?.error?.message ?? 'Delete failed' })),
          ),
        ),
      ),
    ),
  );

  reloadAfterMutations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        NoteActions.softDeleteSuccess,
        NoteActions.restoreSuccess,
        NoteActions.hardDeleteSuccess,
      ),
      map(() => NoteActions.loadPage()),
    ),
  );

  failuresToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          NoteActions.loadPageFailure,
          NoteActions.createFailure,
          NoteActions.updateFailure,
          NoteActions.softDeleteFailure,
          NoteActions.restoreFailure,
          NoteActions.hardDeleteFailure,
        ),
        tap(({ error }) => this.toast.error(error || 'Something went wrong')),
      ),
    { dispatch: false },
  );
}

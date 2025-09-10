import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProjectService } from '../../../core/services';
import { ProjectActions } from './project.actions';
import { ToastService } from '../../../core/services';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectArchived, selectPaging, selectQuery } from './project.selectors';

@Injectable({ providedIn: 'root' })
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);
  private store = inject(Store);

  queryChangeDebounced$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.setQuery),
      map(({ q }) => (q ?? '').trim()),
      debounceTime(600),
      distinctUntilChanged(),
      map(() => ProjectActions.loadPage()),
    ),
  );

  reloadOnParamsChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.setArchived, ProjectActions.setPaging),
      map(() => ProjectActions.loadPage()),
    ),
  );

  loadPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadPage),
      withLatestFrom(
        this.store.select(selectQuery),
        this.store.select(selectPaging),
        this.store.select(selectArchived),
      ),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      switchMap(([_, q, paging, archived]) =>
        this.projectService.list({ q, archived, ...paging }).pipe(
          map((resp) => ProjectActions.loadPageSuccess({ resp })),
          catchError((err) =>
            of(ProjectActions.loadPageFailure({ error: err?.error?.message ?? 'Load failed' })),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.create),
      mergeMap(({ dto }) =>
        this.projectService.create(dto).pipe(
          map((project) => ProjectActions.createSuccess({ project })),
          catchError((err) =>
            of(ProjectActions.createFailure({ error: err?.error?.message ?? 'Create failed' })),
          ),
        ),
      ),
    ),
  );

  toastOnCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectActions.createSuccess),
        map(() => this.toast.success('Project created')),
      ),
    { dispatch: false },
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.createSuccess),
      map(() => ProjectActions.loadPage()),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.update),
      mergeMap(({ id, dto }) =>
        this.projectService.update(id, dto).pipe(
          map((project) => ProjectActions.updateSuccess({ project })),
          catchError((err) =>
            of(ProjectActions.updateFailure({ error: err?.error?.message ?? 'Update failed' })),
          ),
        ),
      ),
    ),
  );

  toastOnUpdate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectActions.updateSuccess),
        map(() => this.toast.success('Project updated')),
      ),
    { dispatch: false },
  );

  pin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.pin),
      mergeMap(({ id, pinned }) =>
        this.projectService.pin(id, pinned).pipe(
          map((project) => ProjectActions.pinSuccess({ project })),
          catchError((err) =>
            of(ProjectActions.pinFailure({ error: err?.error?.message ?? 'Pin failed' })),
          ),
        ),
      ),
    ),
  );

  softDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.softDelete),
      mergeMap(({ id }) =>
        this.projectService.softDelete(id).pipe(
          map(() => ProjectActions.softDeleteSuccess({ id })),
          catchError((err) =>
            of(
              ProjectActions.softDeleteFailure({ error: err?.error?.message ?? 'Archive failed' }),
            ),
          ),
        ),
      ),
    ),
  );

  toastOnSoftDelete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectActions.softDeleteSuccess),
        map(() => this.toast.show('Project archived')),
      ),
    { dispatch: false },
  );

  reloadAfterSoftDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.softDeleteSuccess),
      map(() => ProjectActions.loadPage()),
    ),
  );

  restore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.restore),
      mergeMap(({ id }) =>
        this.projectService.restore(id).pipe(
          map(() => ProjectActions.restoreSuccess({ id })),
          catchError((err) =>
            of(ProjectActions.restoreFailure({ error: err?.error?.message ?? 'Restore failed' })),
          ),
        ),
      ),
    ),
  );

  toastOnRestore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProjectActions.restoreSuccess),
        map(() => this.toast.success('Project restored')),
      ),
    { dispatch: false },
  );

  reloadAfterRestore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.restoreSuccess),
      map(() => ProjectActions.loadPage()),
    ),
  );

  hardDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.hardDelete),
      mergeMap(({ id }) =>
        this.projectService.hardDelete(id).pipe(
          map(() => ProjectActions.hardDeleteSuccess({ id })),
          catchError((err) =>
            of(
              ProjectActions.hardDeleteFailure({
                error: err?.error?.message ?? 'Hard delete failed',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  toastOnFailures$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ProjectActions.loadPageFailure,
          ProjectActions.createFailure,
          ProjectActions.updateFailure,
          ProjectActions.pinFailure,
          ProjectActions.softDeleteFailure,
          ProjectActions.restoreFailure,
          ProjectActions.hardDeleteFailure,
        ),
        map(({ error }) => this.toast.error(error || 'Something went wrong')),
      ),
    { dispatch: false },
  );
}

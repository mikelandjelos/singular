import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Project } from '../../../core/types';
import { ProjectActions } from './project.actions';

export interface ProjectState extends EntityState<Project> {
  loading: boolean;
  saving: boolean;
  error: string | null;
  q: string;
  archived: boolean;
  offset: number;
  limit: number;
  total: number;
}

export const adapter = createEntityAdapter<Project>({
  selectId: (p) => p.id,
  sortComparer: false, // backend already sorts (pinned desc, updated desc)
});

export const initialState: ProjectState = adapter.getInitialState({
  loading: false,
  saving: false,
  error: null,
  q: '',
  archived: false,
  offset: 0,
  limit: 20,
  total: 0,
});

export const projectReducer = createReducer(
  initialState,

  on(ProjectActions.setQuery, (s, { q }) => ({ ...s, q })),
  on(ProjectActions.setArchived, (s, { archived }) => ({ ...s, archived })),
  on(ProjectActions.setPaging, (s, { offset, limit }) => ({ ...s, offset, limit })),

  on(ProjectActions.loadPage, (s) => ({ ...s, loading: true, error: null })),
  on(ProjectActions.loadPageSuccess, (s, { resp }) => {
    const { items, meta } = resp;
    const newState = adapter.setAll(items, s);
    return {
      ...newState,
      loading: false,
      offset: meta.offset,
      limit: meta.limit,
      total: meta.total,
    };
  }),
  on(ProjectActions.loadPageFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(ProjectActions.create, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.createSuccess, (s, { project }) => {
    const newState = adapter.addOne(project, s);
    return { ...newState, saving: false };
  }),
  on(ProjectActions.createFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(ProjectActions.update, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.updateSuccess, (s, { project }) => {
    const newState = adapter.upsertOne(project, s);
    return { ...newState, saving: false };
  }),
  on(ProjectActions.updateFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(ProjectActions.pin, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.pinSuccess, (s, { project }) => {
    const newState = adapter.upsertOne(project, s);
    return { ...newState, saving: false };
  }),
  on(ProjectActions.pinFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(ProjectActions.softDelete, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.softDeleteSuccess, (s) => ({ ...s, saving: false })),
  on(ProjectActions.softDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(ProjectActions.restore, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.restoreSuccess, (s) => ({ ...s, saving: false })),
  on(ProjectActions.restoreFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(ProjectActions.hardDelete, (s) => ({ ...s, saving: true, error: null })),
  on(ProjectActions.hardDeleteSuccess, (s, { id }) => {
    const newState = adapter.removeOne(id, s);
    return { ...newState, saving: false };
  }),
  on(ProjectActions.hardDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors();

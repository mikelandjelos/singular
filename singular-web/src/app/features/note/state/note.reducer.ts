import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Note } from '../../../core/types';
import { NoteActions } from './note.actions';

export interface NoteState extends EntityState<Note> {
  loading: boolean;
  saving: boolean;
  error: string | null;

  q: string;
  archivedOnly: boolean;
  selectedTagIds: string[];
  selectedProjectIds: string[];

  offset: number;
  limit: number;
  total: number;
}

export const noteAdapter = createEntityAdapter<Note>({
  selectId: (n) => n.id,
  sortComparer: false,
});

export const initialState: NoteState = noteAdapter.getInitialState({
  loading: false,
  saving: false,
  error: null,

  q: '',
  archivedOnly: false,
  selectedTagIds: [],
  selectedProjectIds: [],

  offset: 0,
  limit: 20,
  total: 0,
});

export const noteReducer = createReducer(
  initialState,

  on(NoteActions.setQuery, (s, { q }) => ({ ...s, q })),
  on(NoteActions.setArchivedOnly, (s, { archived }) => ({ ...s, archivedOnly: archived })),
  on(NoteActions.toggleTagFilter, (s, { tagId }) => {
    const set = new Set(s.selectedTagIds);
    if (set.has(tagId)) {
      set.delete(tagId);
    } else {
      set.add(tagId);
    }
    return { ...s, selectedTagIds: [...set] };
  }),
  on(NoteActions.toggleProjectFilter, (s, { projectId }) => {
    const set = new Set(s.selectedProjectIds);
    if (set.has(projectId)) {
      set.delete(projectId);
    } else {
      set.add(projectId);
    }
    return { ...s, selectedProjectIds: [...set] };
  }),
  on(NoteActions.clearFilters, (s) => ({
    ...s,
    q: '',
    selectedTagIds: [],
    selectedProjectIds: [],
  })),
  on(NoteActions.setPaging, (s, { offset, limit }) => ({ ...s, offset, limit })),

  on(NoteActions.loadPage, (s) => ({ ...s, loading: true, error: null })),
  on(NoteActions.loadPageSuccess, (s, { resp }) => {
    const st = noteAdapter.setAll(resp.items, s);
    return {
      ...st,
      loading: false,
      offset: resp.meta.offset,
      limit: resp.meta.limit,
      total: resp.meta.total,
    };
  }),
  on(NoteActions.loadPageFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(NoteActions.create, (s) => ({ ...s, saving: true, error: null })),
  on(NoteActions.createSuccess, (s, { note }) => ({
    ...noteAdapter.addOne(note, s),
    saving: false,
  })),
  on(NoteActions.createFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(NoteActions.update, (s) => ({ ...s, saving: true, error: null })),
  on(NoteActions.updateSuccess, (s, { note }) => ({
    ...noteAdapter.upsertOne(note, s),
    saving: false,
  })),
  on(NoteActions.updateFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(NoteActions.softDelete, (s) => ({ ...s, saving: true, error: null })),
  on(NoteActions.softDeleteSuccess, (s) => ({ ...s, saving: false })),
  on(NoteActions.softDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(NoteActions.restore, (s) => ({ ...s, saving: true, error: null })),
  on(NoteActions.restoreSuccess, (s) => ({ ...s, saving: false })),
  on(NoteActions.restoreFailure, (s, { error }) => ({ ...s, saving: false, error })),

  on(NoteActions.hardDelete, (s) => ({ ...s, saving: true, error: null })),
  on(NoteActions.hardDeleteSuccess, (s, { id }) => ({
    ...noteAdapter.removeOne(id, s),
    saving: false,
  })),
  on(NoteActions.hardDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),
);

export const {
  selectAll: selectAllNotes,
  selectEntities: selectNoteEntities,
  selectIds: selectNoteIds,
  selectTotal: selectNoteCount,
} = noteAdapter.getSelectors();

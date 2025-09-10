import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NoteState, selectAllNotes } from './note.reducer';

export const selectNoteState = createFeatureSelector<NoteState>('note');

export const selectNotes = createSelector(selectNoteState, selectAllNotes);
export const selectNotesLoading = createSelector(selectNoteState, (s) => s.loading);
export const selectNotesSaving = createSelector(selectNoteState, (s) => s.saving);
export const selectNotesError = createSelector(selectNoteState, (s) => s.error);

export const selectQuery = createSelector(selectNoteState, (s) => s.q);
export const selectArchivedOnly = createSelector(selectNoteState, (s) => s.archivedOnly);
export const selectSelectedTagIds = createSelector(selectNoteState, (s) => s.selectedTagIds);
export const selectSelectedProjectIds = createSelector(
  selectNoteState,
  (s) => s.selectedProjectIds,
);

export const selectPaging = createSelector(selectNoteState, (s) => ({
  offset: s.offset,
  limit: s.limit,
  total: s.total,
}));
export const selectTotal = createSelector(selectNoteState, (s) => s.total);

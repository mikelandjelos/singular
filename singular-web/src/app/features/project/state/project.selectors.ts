import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState, selectAll } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>('project');
export const selectProjectLoading = createSelector(selectProjectState, (s) => s.loading);
export const selectProjectSaving = createSelector(selectProjectState, (s) => s.saving);
export const selectProjectError = createSelector(selectProjectState, (s) => s.error);

export const selectProjects = createSelector(selectProjectState, selectAll);
export const selectProjectTotal = createSelector(selectProjectState, (s) => s.total);

export const selectQuery = createSelector(selectProjectState, (s) => s.q);
export const selectArchived = createSelector(selectProjectState, (s) => s.archived);
export const selectPaging = createSelector(selectProjectState, (s) => ({
  offset: s.offset,
  limit: s.limit,
}));

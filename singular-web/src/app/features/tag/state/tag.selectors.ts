import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TagState, selectAllTags } from './tag.reducer';

export const selectTagState = createFeatureSelector<TagState>('tag');

export const selectTags = createSelector(selectTagState, selectAllTags);
export const selectTagsLoading = createSelector(selectTagState, (s) => s.loading);
export const selectTagsError = createSelector(selectTagState, (s) => s.error);
export const selectTagsQuery = createSelector(selectTagState, (s) => s.q);
export const selectTagsTotal = createSelector(selectTagState, (s) => s.total);

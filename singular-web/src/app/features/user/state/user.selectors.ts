import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');
export const selectUserLoading = createSelector(selectUserState, (s) => s.loading);
export const selectUserSaving = createSelector(selectUserState, (s) => s.saving);
export const selectUserError = createSelector(selectUserState, (s) => s.error);

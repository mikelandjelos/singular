import { createReducer, on } from '@ngrx/store';
import { UserActions } from './user.actions';

export interface UserState {
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialState: UserState = {
  loading: false,
  saving: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  // update
  on(UserActions.update, (s) => ({ ...s, saving: true, error: null })),
  on(UserActions.updateSuccess, (s) => ({ ...s, saving: false })),
  on(UserActions.updateFailure, (s, { error }) => ({ ...s, saving: false, error })),

  // soft delete
  on(UserActions.softDelete, (s) => ({ ...s, saving: true, error: null })),
  on(UserActions.softDeleteSuccess, (s) => ({ ...s, saving: false })),
  on(UserActions.softDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),

  // restore
  on(UserActions.restore, (s) => ({ ...s, saving: true, error: null })),
  on(UserActions.restoreSuccess, (s) => ({ ...s, saving: false })),
  on(UserActions.restoreFailure, (s, { error }) => ({ ...s, saving: false, error })),

  // hard delete
  on(UserActions.hardDelete, (s) => ({ ...s, saving: true, error: null })),
  on(UserActions.hardDeleteSuccess, (s) => ({ ...s, saving: false })),
  on(UserActions.hardDeleteFailure, (s, { error }) => ({ ...s, saving: false, error })),
);

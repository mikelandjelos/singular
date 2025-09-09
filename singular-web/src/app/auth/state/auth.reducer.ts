import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { UserResponse } from '../../core/types';

export interface AuthState {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, AuthActions.register, AuthActions.loadMe, (s) => ({
    ...s,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, AuthActions.loadMeSuccess, (s, { user }) => ({
    ...s,
    user,
    loading: false,
  })),
  on(AuthActions.registerSuccess, (s) => ({
    ...s,
    loading: false,
  })),
  on(
    AuthActions.loginFailure,
    AuthActions.registerFailure,
    AuthActions.loadMeFailure,
    (s, { error }) => ({ ...s, loading: false, error }),
  ),

  on(AuthActions.logout, (s) => ({ ...s, loading: true })),
  on(AuthActions.logoutSuccess, () => ({ ...initialState })),
  on(AuthActions.logoutFailure, (s, { error }) => ({ ...s, loading: false, error })),
);

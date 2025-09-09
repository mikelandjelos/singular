import { RouterState } from '@ngrx/router-store';
import { AuthState } from './auth/state';

export interface AppState {
  auth: AuthState;
  router: RouterState;
}

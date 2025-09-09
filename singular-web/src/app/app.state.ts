import { RouterState } from '@ngrx/router-store';
import { AuthState } from './features/auth/state';

export interface AppState {
  auth: AuthState;
  router: RouterState;
}

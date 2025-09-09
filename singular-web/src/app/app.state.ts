import { RouterState } from '@ngrx/router-store';
import { AuthState } from './features/auth/state';
import { UserState } from './features/user/state';

export interface AppState {
  auth: AuthState;
  user: UserState;
  router: RouterState;
}

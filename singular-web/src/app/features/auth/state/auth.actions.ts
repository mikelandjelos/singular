import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { LoginDto, RegisterDto, User } from '../../../core/types/';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ loginParams: LoginDto }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),

    Register: props<{ registerParams: RegisterDto }>(),
    'Register Success': emptyProps(),
    'Register Failure': props<{ error: string }>(),

    'Load Me': emptyProps(),
    'Load Me Success': props<{ user: User }>(),
    'Load Me Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),
  },
});

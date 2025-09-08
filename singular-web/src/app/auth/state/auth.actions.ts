import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { LoginDto, RegisterDto, UserResponse } from '../../core/types/';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ loginParams: LoginDto }>(),
    'Login Success': props<{ user: UserResponse }>(),
    'Login Failure': props<{ error: string }>(),

    Register: props<{ registerParams: RegisterDto }>(),
    'Register Success': props<{ user: UserResponse }>(),
    'Register Failure': props<{ error: string }>(),

    'Load Me': emptyProps(),
    'Load Me Success': props<{ user: UserResponse }>(),
    'Load Me Failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),
  },
});

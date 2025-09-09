import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UpdateUserDto, User } from '../../../core/types';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    Update: props<{ id: string; changes: UpdateUserDto }>(),
    'Update Success': props<{ user: User }>(),
    'Update Failure': props<{ error: string }>(),

    'Soft Delete': props<{ id: string }>(),
    'Soft Delete Success': emptyProps(),
    'Soft Delete Failure': props<{ error: string }>(),

    Restore: props<{ id: string }>(),
    'Restore Success': emptyProps(),
    'Restore Failure': props<{ error: string }>(),

    'Hard Delete': props<{ id: string }>(),
    'Hard Delete Success': emptyProps(),
    'Hard Delete Failure': props<{ error: string }>(),
  },
});

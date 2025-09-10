import { createActionGroup, props } from '@ngrx/store';
import { Tag, TagListResponse, CreateTagDto, UpdateTagDto } from '../../../core/types';

export const TagActions = createActionGroup({
  source: 'Tag',
  events: {
    Load: props<{ q?: string }>(),
    'Load Success': props<{ resp: TagListResponse }>(),
    'Load Failure': props<{ error: string }>(),

    Create: props<{ dto: CreateTagDto }>(),
    'Create Success': props<{ tag: Tag }>(),
    'Create Failure': props<{ error: string }>(),

    Update: props<{ id: string; dto: UpdateTagDto }>(),
    'Update Success': props<{ tag: Tag }>(),
    'Update Failure': props<{ error: string }>(),

    Delete: props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),
  },
});

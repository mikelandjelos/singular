import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateNoteDto, Note, NoteListResponse, UpdateNoteDto } from '../../../core/types';

export const NoteActions = createActionGroup({
  source: 'Note',
  events: {
    'Set Query': props<{ q: string }>(),
    'Set Archived Only': props<{ archived: boolean }>(),
    'Toggle Tag Filter': props<{ tagId: string }>(),
    'Toggle Project Filter': props<{ projectId: string }>(),
    'Clear Filters': emptyProps(),
    'Set Paging': props<{ offset: number; limit: number }>(),

    'Load Page': emptyProps(),
    'Load Page Success': props<{ resp: NoteListResponse }>(),
    'Load Page Failure': props<{ error: string }>(),

    Create: props<{ dto: CreateNoteDto }>(),
    'Create Success': props<{ note: Note }>(),
    'Create Failure': props<{ error: string }>(),

    Update: props<{ id: string; dto: UpdateNoteDto }>(),
    'Update Success': props<{ note: Note }>(),
    'Update Failure': props<{ error: string }>(),

    'Soft Delete': props<{ id: string }>(),
    'Soft Delete Success': props<{ id: string }>(),
    'Soft Delete Failure': props<{ error: string }>(),

    Restore: props<{ id: string }>(),
    'Restore Success': props<{ id: string }>(),
    'Restore Failure': props<{ error: string }>(),

    'Hard Delete': props<{ id: string }>(),
    'Hard Delete Success': props<{ id: string }>(),
    'Hard Delete Failure': props<{ error: string }>(),
  },
});

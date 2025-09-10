import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CreateProjectDto,
  Project,
  ProjectListResponse,
  UpdateProjectDto,
} from '../../../core/types';

export const ProjectActions = createActionGroup({
  source: 'Project',
  events: {
    'Set Query': props<{ q: string }>(),
    'Set Archived': props<{ archived: boolean }>(),
    'Set Paging': props<{ offset: number; limit: number }>(),

    'Load Page': emptyProps(),
    'Load Page Success': props<{ resp: ProjectListResponse }>(),
    'Load Page Failure': props<{ error: string }>(),

    Create: props<{ dto: CreateProjectDto }>(),
    'Create Success': props<{ project: Project }>(),
    'Create Failure': props<{ error: string }>(),

    Update: props<{ id: string; dto: UpdateProjectDto }>(),
    'Update Success': props<{ project: Project }>(),
    'Update Failure': props<{ error: string }>(),

    Pin: props<{ id: string; pinned: boolean }>(),
    'Pin Success': props<{ project: Project }>(),
    'Pin Failure': props<{ error: string }>(),

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

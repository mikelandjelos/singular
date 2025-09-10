import { Id, Tag } from './tag.types';

export interface ProjectRef {
  id: Id;
  name: string;
  color?: string | null;
}

export interface Note {
  id: Id;
  userId: Id;
  title: string;
  content: string;
  workDate?: string | null;
  project?: ProjectRef | null;
  tags: Tag[];
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
  workDate?: string | null;
  projectId?: Id | null;
  tagIds?: Id[];
  tagNames?: string[];
}

export type UpdateNoteDto = Partial<CreateNoteDto>;

export interface ListNotesParams {
  q?: string;
  projectIds?: Id[];
  tagIds?: Id[];
  offset?: number;
  limit?: number;
  archived?: boolean; // true=only archived, false/undefined=only active
}

export interface NoteListResponse {
  items: Note[];
  meta: {
    offset: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

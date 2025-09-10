import { Note } from './note.entity';

export type CreateNoteInput = {
  title: string;
  content?: string;
  workDate?: string | null;
  projectId?: string | null;
  tagIds?: string[];
  tagNames?: string[];
};

export type UpdateNoteInput = Partial<
  Pick<Note, 'title' | 'content' | 'workDate' | 'projectId'>
> & {
  tagIds?: string[];
  tagNames?: string[];
};

export type ListNotesParams = {
  q?: string;
  projectIds?: string[];
  tagIds?: string[];
  offset?: number;
  limit?: number;
  archived?: boolean;
};

export type UpdateNoteResult =
  | { ok: true; note: Note }
  | { ok: false; reason: 'not_found' | 'bad_project' };

export type CreateNoteResult =
  | { ok: true; note: Note }
  | { ok: false; reason: 'bad_project' };

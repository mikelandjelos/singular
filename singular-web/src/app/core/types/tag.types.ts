export type Id = string;

export interface Tag {
  id: Id;
  userId: Id;
  name: string;
  color?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export type UpdateTagDto = Partial<CreateTagDto>;

export interface ListTagsParams {
  q?: string;
  offset?: number;
  limit?: number;
}

export interface TagListResponse {
  items: Tag[];
  meta: { offset: number; limit: number; total: number; hasNext: boolean; hasPrev: boolean };
}

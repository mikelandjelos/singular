export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  deletedAt: string | null;
}

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  color?: string | null;
  pinned?: boolean;
}

export interface UpdateProjectDto {
  name: string;
  description?: string | null;
  color?: string | null;
  pinned?: boolean;
}

export interface ProjectListResponse {
  items: Project[];
  meta: {
    offset: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

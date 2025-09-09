export interface LinkDto {
  label: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  website?: string;
  summaryMd?: string;
  links?: LinkDto[];
  skills?: string[];
  languages?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

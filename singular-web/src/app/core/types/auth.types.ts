export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface LinkDto {
  label: string;
  url: string;
}

export interface UserResponse {
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

export type AuthMeResponse = UserResponse;

export interface LoginResponse {
  user: UserResponse;
}

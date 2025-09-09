import { User } from './user.types';

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

export type AuthMeResponse = User;

export interface LoginResponse {
  user: User;
}

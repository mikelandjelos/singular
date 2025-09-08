import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginDto, LoginResponse, RegisterDto, AuthMeResponse } from '../types/auth.types';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  register(body: RegisterDto): Observable<AuthMeResponse> {
    return this.http.post<AuthMeResponse>(`${this.base}/auth/register`, body);
  }

  login(body: LoginDto): Observable<LoginResponse> {
    // httpOnly cookie comes from server; interceptor adds withCredentials
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, body);
  }

  me(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this.base}/auth/me`);
  }

  logout(): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.base}/auth/logout`, {});
  }
}

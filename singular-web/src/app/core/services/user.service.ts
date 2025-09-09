import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User, UpdateUserDto } from '../types';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, dto);
  }

  softDelete(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }

  restore(id: string): Observable<{ ok: true }> {
    return this.http.patch<{ ok: true }>(`${this.base}/${id}/restore`, {});
  }

  hardDelete(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}/hard`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateProjectDto, Project, ProjectListResponse, UpdateProjectDto } from '../types/';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/projects`;

  list(params: {
    q?: string;
    offset?: number;
    limit?: number;
    archived?: boolean;
  }): Observable<ProjectListResponse> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.offset !== undefined) httpParams = httpParams.set('offset', params.offset);
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit);
    if (params.archived !== undefined) httpParams = httpParams.set('archived', params.archived);
    return this.http.get<ProjectListResponse>(this.base, { params: httpParams });
  }

  // TODO: redundant
  search(params: { text: string; offset?: number; limit?: number }): Observable<Project[]> {
    let httpParams = new HttpParams().set('text', params.text);
    if (params.offset !== undefined) httpParams = httpParams.set('offset', params.offset);
    if (params.limit !== undefined) httpParams = httpParams.set('limit', params.limit);
    return this.http.get<Project[]>(`${this.base}/search`, { params: httpParams });
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  create(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.base, dto);
  }

  update(id: string, dto: UpdateProjectDto): Observable<Project> {
    // Per your decision: PUT full replacement (frontend sends all fields)
    return this.http.put<Project>(`${this.base}/${id}`, dto);
  }

  pin(id: string, pinned: boolean): Observable<Project> {
    return this.http.patch<Project>(`${this.base}/${id}/pin`, { pinned });
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

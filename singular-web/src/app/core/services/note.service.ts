import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateNoteDto, ListNotesParams, Note, NoteListResponse, UpdateNoteDto } from '../types/';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notes`;

  list(params: ListNotesParams): Observable<NoteListResponse> {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.projectIds?.length) p = p.set('projectIds', params.projectIds.join(','));
    if (params.tagIds?.length) p = p.set('tagIds', params.tagIds.join(','));
    if (params.offset !== undefined) p = p.set('offset', params.offset);
    if (params.limit !== undefined) p = p.set('limit', params.limit);
    if (params.archived !== undefined) p = p.set('archived', String(params.archived));
    return this.http.get<NoteListResponse>(this.base, { params: p });
  }

  get(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.base}/${id}`);
  }

  create(dto: CreateNoteDto): Observable<Note> {
    return this.http.post<Note>(this.base, dto);
  }

  update(id: string, dto: UpdateNoteDto): Observable<Note> {
    return this.http.put<Note>(`${this.base}/${id}`, dto);
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

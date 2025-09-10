import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateTagDto, ListTagsParams, Tag, TagListResponse, UpdateTagDto } from '../types';

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tags`;

  list(params: ListTagsParams = {}): Observable<TagListResponse> {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.offset !== undefined) p = p.set('offset', params.offset);
    if (params.limit !== undefined) p = p.set('limit', params.limit);
    return this.http.get<TagListResponse>(this.base, { params: p });
  }

  create(dto: CreateTagDto): Observable<Tag> {
    return this.http.post<Tag>(this.base, dto);
  }

  update(id: string, dto: UpdateTagDto): Observable<Tag> {
    return this.http.put<Tag>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }
}

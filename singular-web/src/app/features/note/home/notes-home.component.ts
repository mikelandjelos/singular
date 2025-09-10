import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { NoteActions } from '../state/note.actions';
import { TagActions } from '../../tag/state/tag.actions';
import {
  selectNotes,
  selectNotesLoading,
  selectQuery,
  selectSelectedProjectIds,
  selectSelectedTagIds,
} from '../state/note.selectors';
import { selectTags } from '../../tag/state/tag.selectors';

import { NoteActions as NA } from '../state/note.actions';
import { ProjectService } from '../../../core/services';
import { Project } from '../../../core/types';
import { NoteCreateDialogComponent } from '../note-create-dialog/note-create-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'app-notes-home',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './notes-home.component.html',
  styleUrls: ['./notes-home.component.scss'],
})
export class NotesHomeComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private projectApi = inject(ProjectService);

  notes$ = this.store.select(selectNotes);
  loading$ = this.store.select(selectNotesLoading);
  tags$ = this.store.select(selectTags);

  selectedTagIds = signal<Set<string>>(new Set<string>());
  selectedProjects = signal<Project[]>([]);

  searchCtrl = new FormControl<string>('');
  projectSearch = new FormControl<string>('');

  projectOptions$: Observable<Project[]> = this.projectSearch.valueChanges.pipe(
    startWith(''),
    debounceTime(250),
    switchMap((q) =>
      q
        ? this.projectApi.list({ q, limit: 10 })
        : of({
            items: [],
            meta: { offset: 0, limit: 0, total: 0, hasNext: false, hasPrev: false },
          }),
    ),
    map((res) => res.items),
  );

  ngOnInit(): void {
    this.store.dispatch(TagActions.load({}));
    this.store.dispatch(NoteActions.loadPage());

    this.store
      .select(selectQuery)
      .pipe(tap((q) => this.searchCtrl.setValue(q, { emitEvent: false })))
      .subscribe();

    this.searchCtrl.valueChanges
      .pipe(
        map((v) => v ?? ''),
        tap((q) => this.store.dispatch(NoteActions.setQuery({ q }))),
      )
      .subscribe();

    // keep selected tag/project ids in signals from store
    this.store
      .select(selectSelectedTagIds)
      .subscribe((ids) => this.selectedTagIds.set(new Set(ids)));
    this.store.select(selectSelectedProjectIds).subscribe((ids) => {
      const set = new Set(ids);
      // keep only id/name/color for selected cards (display)
      const cur = this.selectedProjects();
      this.selectedProjects.set(cur.filter((p) => set.has(p.id)));
    });
  }

  openCreateDialog() {
    this.dialog.open(NoteCreateDialogComponent, { width: '560px', autoFocus: 'first-tabbable' });
  }

  toggleTag(id: string) {
    this.store.dispatch(NoteActions.toggleTagFilter({ tagId: id }));
  }

  addProject(p: Project) {
    if (!this.selectedProjects().some((x) => x.id === p.id)) {
      this.selectedProjects.set([...this.selectedProjects(), p]);
      this.store.dispatch(NoteActions.toggleProjectFilter({ projectId: p.id }));
    }
    // clear AC input
    this.projectSearch.setValue('');
  }

  removeProject(projectId: string) {
    this.selectedProjects.set(this.selectedProjects().filter((p) => p.id !== projectId));
    this.store.dispatch(NoteActions.toggleProjectFilter({ projectId }));
  }

  edit(id: string) {
    const seg = this.router.url.split('/').filter(Boolean)[0] || '';
    this.router.navigate(['/', seg, 'notes', id, 'edit']);
  }
  archive(id: string) {
    this.store.dispatch(NA.softDelete({ id }));
  }
  hardDelete(id: string) {
    this.store.dispatch(NA.hardDelete({ id }));
  }

  excerpt(md: string, n = 180): string {
    const s = (md || '').replace(/[#*_>\-`]/g, '').replace(/\[(.*?)\]\((.*?)\)/g, '$1');
    return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
  }
}

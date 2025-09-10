import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import {
  debounceTime,
  startWith,
  switchMap,
  map,
  distinctUntilChanged,
  catchError,
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { NoteActions } from '../state/note.actions';
import { ProjectService, TagService } from '../../../core/services';
import { Project, Tag } from '../../../core/types';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  standalone: true,
  selector: 'app-note-create-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './note-create-dialog.component.html',
  styleUrls: ['./note-create-dialog.component.scss'],
})
export class NoteCreateDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NoteCreateDialogComponent>);
  private store = inject(Store);
  private projectApi = inject(ProjectService);
  private tagApi = inject(TagService);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
  });

  projectSearch = new FormControl<string>('');
  tagSearch = new FormControl<string>('');

  selectedProject: Project | null = null;
  selectedTags: (Tag | { name: string })[] = [];

  projectOptions$ = this.projectSearch.valueChanges.pipe(
    startWith(''), // fire once to load initial options
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((q) =>
      this.projectApi.list({ q: (q || '').trim() || undefined, limit: 10, archived: false }).pipe(
        map((res) => res.items),
        catchError(() => of([])), // never break the UI
      ),
    ),
  );
  tagOptions$: Observable<Tag[]> = this.tagSearch.valueChanges.pipe(
    startWith(''),
    debounceTime(250),
    switchMap((q) => this.tagApi.list({ q: q || '', limit: 50 })),
    map((res) => res.items),
  );

  selectProject(p: Project) {
    this.selectedProject = p;
    this.projectSearch.setValue('', { emitEvent: false });
  }
  clearProject() {
    this.selectedProject = null;
  }

  addExistingTag(t: Tag) {
    if (!this.selectedTags.some((x) => (x as Tag).id === t.id)) {
      this.selectedTags.push(t);
    }
    this.tagSearch.setValue('', { emitEvent: false });
  }

  addFreeTag() {
    const name = (this.tagSearch.value || '').trim();
    if (!name) return;
    if (!this.selectedTags.some((x) => this.displayTag(x).toLowerCase() === name.toLowerCase())) {
      this.selectedTags.push({ name });
    }
    this.tagSearch.setValue('', { emitEvent: false });
  }

  removeTag(tag: Tag | { name: string }) {
    this.selectedTags = this.selectedTags.filter((x) => x !== tag);
  }

  tagColor(t: Tag | { name: string }) {
    return (t as Tag).color ?? '#e5e7eb';
  }

  displayTag(t: Tag | { name: string }) {
    return (t as Tag).name ?? (t as any).name;
  }

  save() {
    const title = this.form.value.title!.trim();
    const tagIds = this.selectedTags
      .filter((x): x is Tag => !!(x as Tag).id)
      .map((x) => (x as Tag).id);

    const tagNames = this.selectedTags
      .filter((x): x is { name: string } => !(x as any).id)
      .map((x) => (x as any).name);

    this.store.dispatch(
      NoteActions.create({
        dto: {
          title,
          projectId: this.selectedProject?.id ?? null,
          tagIds: tagIds.length ? tagIds : undefined,
          tagNames: tagNames.length ? tagNames : undefined,
          content: '', // start empty, user edits next page
        },
      }),
    );
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  projectDisplay = (p: Project | null) => (p ? p.name : '');
  trackById = (_: number, x: { id: string }) => x.id;
}

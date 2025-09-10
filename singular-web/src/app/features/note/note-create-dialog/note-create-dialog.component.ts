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
  template: `
    <h2 mat-dialog-title>New Note</h2>
    <form [formGroup]="form" class="form" (ngSubmit)="save()">
      <mat-form-field appearance="outline" class="w">
        <mat-label>Title</mat-label>
        <input matInput formControlName="title" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Project</mat-label>
        <input
          type="text"
          matInput
          [matAutocomplete]="autoProj"
          [formControl]="projectSearch"
          placeholder="Search project…"
        />
        <mat-autocomplete
          #autoProj="matAutocomplete"
          [displayWith]="projectDisplay"
          (optionSelected)="selectProject($event.option.value)"
        >
          <mat-option *ngFor="let p of projectOptions$ | async; trackBy: trackById" [value]="p">
            <span class="dot" [style.background]="p.color || '#e5e7eb'"></span>{{ p.name }}
          </mat-option>
        </mat-autocomplete>
        <button
          *ngIf="selectedProject"
          matSuffix
          mat-icon-button
          type="button"
          (click)="clearProject()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <div *ngIf="selectedProject" class="proj-pill">
        <span class="dot" [style.background]="selectedProject?.color || '#e5e7eb'"></span>
        {{ selectedProject?.name }}
        <button mat-icon-button type="button" (click)="clearProject()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Tags</mat-label>
        <input
          type="text"
          matInput
          [matAutocomplete]="autoTag"
          [formControl]="tagSearch"
          placeholder="Search or type to create"
          (keydown.enter)="addFreeTag()"
        />
        <mat-autocomplete
          #autoTag="matAutocomplete"
          (optionSelected)="addExistingTag($event.option.value)"
        >
          <mat-option *ngFor="let t of tagOptions$ | async" [value]="t">
            <span class="dot" [style.background]="t.color || '#e5e7eb'"></span>{{ t.name }}
          </mat-option>
          <mat-option *ngIf="(tagSearch.value || '').trim().length" [disabled]="true">—</mat-option>
          <mat-option
            *ngIf="(tagSearch.value || '').trim().length"
            (onSelectionChange)="addFreeTag()"
          >
            Create “{{ (tagSearch.value || '').trim() }}”
          </mat-option>
        </mat-autocomplete>
      </mat-form-field>

      <div class="chips">
        <mat-chip-row *ngFor="let t of selectedTags" (removed)="removeTag(t)">
          <span class="dot" [style.background]="tagColor(t)"></span>{{ displayTag(t) }}
          <button matChipRemove><mat-icon>close</mat-icon></button>
        </mat-chip-row>
      </div>

      <div class="actions">
        <button mat-button type="button" (click)="close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Create
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 8px 12px;
      }
      .w {
        width: 100%;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
      }
      .proj-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        padding: 6px 10px;
        border-radius: 999px;
        width: max-content;
        margin-top: -6px;
      }
    `,
  ],
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

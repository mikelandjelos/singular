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
  template: `
    <div class="toolbar">
      <mat-form-field appearance="outline" class="search">
        <mat-label>Search notes</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Title or content" />
        <button
          *ngIf="searchCtrl.value"
          matSuffix
          mat-icon-button
          aria-label="Clear"
          (click)="searchCtrl.setValue('')"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
    </div>

    <div class="filters">
      <div class="filter-group">
        <div class="label">Tags</div>

        <mat-chip-listbox multiple class="chips" aria-label="Tag filters">
          @for (t of tags$ | async; track $index) {
            <mat-chip-option
              [selected]="selectedTagIds().has(t.id)"
              (selectionChange)="toggleTag(t.id)"
              class="tag-chip"
            >
              <span class="dot" [style.background]="t.color || '#e5e7eb'"></span>
              {{ t.name }}
            </mat-chip-option>
          }
        </mat-chip-listbox>
      </div>

      <div class="filter-group">
        <!-- <div class="label">Projects</div>
        <mat-form-field class="project-ac" appearance="outline">
          <mat-label>Filter by project</mat-label>
          <input
            type="text"
            matInput
            [formControl]="projectSearch"
            [matAutocomplete]="autoProj"
            placeholder="Type to search…"
          />
          <mat-autocomplete
            #autoProj="matAutocomplete"
            (optionSelected)="addProject($event.option.value)"
          >
            <mat-option *ngFor="let p of projectOptions$ | async" [value]="p">
              <span class="proj-dot" [style.background]="p.color || '#e5e7eb'"></span>{{ p.name }}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field> -->

        <div class="chips">
          <mat-chip-row
            *ngFor="let p of selectedProjects()"
            (removed)="removeProject(p.id)"
            class="proj-chip"
          >
            <span class="proj-dot" [style.background]="p.color || '#e5e7eb'"></span>{{ p.name }}
            <button matChipRemove><mat-icon>close</mat-icon></button>
          </mat-chip-row>
        </div>
      </div>
    </div>

    <ng-container *ngIf="loading$ | async; else gridTmpl">
      <div class="loading">
        <mat-spinner diameter="32"></mat-spinner>
      </div>
    </ng-container>

    <ng-template #gridTmpl>
      <div class="grid">
        <!-- Plus card -->
        <button class="plus-card" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <div>New Note</div>
        </button>

        <!-- Note cards -->
        <mat-card class="note-card" *ngFor="let n of notes$ | async">
          <mat-card-header>
            <mat-card-title class="title" [matTooltip]="n.title">{{ n.title }}</mat-card-title>
            <button mat-icon-button [matMenuTriggerFor]="menu" class="more">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="edit(n.id)">
                <mat-icon>edit</mat-icon><span>Edit</span>
              </button>
              <button mat-menu-item (click)="archive(n.id)">
                <mat-icon>inventory_2</mat-icon><span>Archive</span>
              </button>
              <button mat-menu-item (click)="hardDelete(n.id)">
                <mat-icon>delete</mat-icon><span>Delete</span>
              </button>
            </mat-menu>
          </mat-card-header>

          <mat-card-content>
            <div class="preview">{{ excerpt(n.content) }}</div>

            <div class="meta">
              <div class="proj" *ngIf="n.project">
                <span class="proj-dot" [style.background]="n.project?.color || '#e5e7eb'"></span>
                {{ n.project?.name }}
              </div>
              <div class="tag-list">
                <mat-chip-row *ngFor="let t of n.tags" class="tag small">
                  <span class="dot" [style.background]="t.color || '#e5e7eb'"></span>{{ t.name }}
                </mat-chip-row>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 8px 0 16px;
      }
      .toolbar .search {
        flex: 1 1 480px;
        max-width: 640px;
      }
      .spacer {
        flex: 1;
      }

      .filters {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 4px 0 12px;
      }
      .filter-group .label {
        font-size: 0.85rem;
        opacity: 0.8;
        margin-bottom: 6px;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .tag-chip,
      .proj-chip {
        --chip-color: #e5e7eb;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      .tag-chip .dot,
      .tag.small .dot,
      .proj-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
      }
      .project-ac {
        min-width: 260px;
        width: 100%;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }
      .plus-card {
        border: 2px dashed rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        background: transparent;
      }
      .plus-card mat-icon {
        font-size: 32px;
        height: 32px;
        width: 32px;
      }
      .note-card {
        border-radius: 12px;
      }
      .note-card .title {
        font-weight: 600;
        line-height: 1.2;
        padding-right: 32px;
      }
      .note-card .more {
        position: absolute;
        right: 4px;
        top: 4px;
      }
      .preview {
        margin: 8px 0 12px;
        color: rgba(0, 0, 0, 0.75);
        min-height: 42px;
      }
      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .meta .proj {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9rem;
        opacity: 0.9;
      }
      .tag-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .tag.small {
        font-size: 0.75rem;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      @media (max-width: 900px) {
        .filters {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
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

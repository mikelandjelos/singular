import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
import { Store } from '@ngrx/store';
import { NoteActions } from '../state/note.actions';
import { NoteService } from '../../../core/services';
import { Note, UpdateNoteDto } from '../../../core/types';

@Component({
  standalone: true,
  selector: 'app-note-edit',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MarkdownModule,
  ],
  template: `
    <div class="bar">
      <button
        mat-stroked-button
        color="primary"
        (click)="save()"
        [disabled]="form.invalid || !form.dirty"
      >
        <mat-icon>save</mat-icon>&nbsp;Save
      </button>
      <span class="dirty" *ngIf="form.dirty">Unsaved changes</span>
      <span class="spacer"></span>
      <button mat-button (click)="back()"><mat-icon>arrow_back</mat-icon>&nbsp;Back</button>
    </div>

    <form [formGroup]="form" class="split">
      <div class="left">
        <mat-form-field appearance="outline" class="w">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w">
          <mat-label>Markdown</mat-label>
          <textarea matInput rows="22" formControlName="content"></textarea>
        </mat-form-field>
      </div>

      <div class="right">
        <div class="preview-title">{{ form.value.title || 'Title' }}</div>
        <markdown [data]="form.value.content || ''"></markdown>
      </div>
    </form>
  `,
  styles: [
    `
      .bar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 8px 0 12px;
      }
      .dirty {
        font-size: 0.9rem;
        opacity: 0.7;
      }
      .spacer {
        flex: 1;
      }
      .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .left,
      .right {
        min-width: 0;
      }
      .w {
        width: 100%;
      }
      .preview-title {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 8px;
      }
      @media (max-width: 1000px) {
        .split {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class NoteEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private noteService = inject(NoteService);
  private store = inject(Store);

  noteId = '';
  original: Note | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    content: [''],
  });

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id')!;
    this.noteService.get(this.noteId).subscribe((n) => {
      this.original = n;
      this.form.reset({ title: n.title, content: n.content }, { emitEvent: false });
      this.form.markAsPristine();
    });
  }

  save() {
    if (!this.original) return;
    const dto: UpdateNoteDto = {
      title: this.form.value.title!,
      content: this.form.value.content ?? '',
    };
    this.store.dispatch(NoteActions.update({ id: this.noteId, dto }));
    this.form.markAsPristine();
  }

  back() {
    window.history.back();
  }

  // For CanDeactivate guard
  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}

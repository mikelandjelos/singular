import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../../core/types';
import { Store } from '@ngrx/store';
import { ProjectActions } from '../state/project.actions';

@Component({
  standalone: true,
  selector: 'app-project-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Project' : 'New Project' }}</h2>
    <form [formGroup]="form" class="form" (ngSubmit)="save()">
      <mat-form-field appearance="outline" class="w">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Description</mat-label>
        <textarea matInput rows="3" formControlName="description"></textarea>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Color</mat-label>
        <input matInput formControlName="color" placeholder="#4f46e5" />
      </mat-form-field>

      <mat-checkbox formControlName="pinned">Pinned</mat-checkbox>

      <div class="actions">
        <button mat-button type="button" (click)="close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          {{ data ? 'Save' : 'Create' }}
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
        margin-top: 8px;
      }
    `,
  ],
})
export class ProjectDialogComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<ProjectDialogComponent>);

  public data: Project | null = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: [
      this.data?.name ?? '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(120)],
    ],
    description: [this.data?.description ?? null, [Validators.maxLength(2000)]],
    color: [this.data?.color ?? null, [Validators.maxLength(32)]],
    pinned: [this.data?.pinned ?? false],
  });

  save() {
    const v = this.form.getRawValue();
    if (this.data) {
      this.store.dispatch(
        ProjectActions.update({
          id: this.data.id,
          dto: {
            name: v.name!,
            description: v.description ?? null,
            color: v.color ?? null,
            pinned: !!v.pinned,
          },
        }),
      );
    } else {
      this.store.dispatch(
        ProjectActions.create({
          dto: {
            name: v.name!,
            description: v.description ?? null,
            color: v.color ?? null,
            pinned: !!v.pinned,
          },
        }),
      );
    }
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}

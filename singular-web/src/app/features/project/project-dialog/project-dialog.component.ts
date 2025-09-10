import { ColorPickerDirective } from 'ngx-color-picker';
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
import { MatIconModule } from '@angular/material/icon';

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
    ColorPickerDirective,
    MatIconModule,
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

      <div class="mat-form-field-wrapper">
        <div class="mat-form-field-flex">
          <div class="mat-form-field-prefix"></div>
          <div class="mat-form-field-infix">
            <span class="mat-form-field-label">Color</span>
            <button
              type="button"
              class="color-input"
              [style.background]="colorModel || '#e5e7eb'"
              [colorPicker]="colorModel || '#e5e7eb'"
              (colorPickerChange)="onColorChange($event)"
              [cpOutputFormat]="'hex'"
              [cpAlphaChannel]="'disabled'"
              [cpPosition]="'bottom'"
              [cpOKButton]="true"
              [cpCancelButton]="true"
              [cpPresetColors]="presets"
              [cpPresetLabel]="'Presets'"
              [cpSaveClickOutside]="true"
              aria-label="Pick color"
            >
              <mat-icon>palette</mat-icon>
              <span class="color-value">{{ colorModel || 'Select color' }}</span>
            </button>
          </div>
        </div>
        <div class="mat-form-field-underline"></div>
      </div>

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
      .mat-form-field-wrapper {
        position: relative;
        padding-bottom: 1.25em;
        margin-bottom: 8px;
      }

      .mat-form-field-flex {
        display: flex;
        align-items: baseline;
        box-sizing: border-box;
        width: 100%;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        padding: 12px;
        min-height: 56px;
      }

      .mat-form-field-label {
        position: absolute;
        top: -8px;
        left: 12px;
        background: white;
        padding: 0 4px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .mat-form-field-infix {
        display: flex;
        align-items: center;
        width: 100%;
      }

      .color-input {
        display: flex;
        align-items: center;
        gap: 8px;
        border: none;
        background: transparent;
        cursor: pointer;
        width: 100%;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .color-input:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .color-value {
        color: rgba(0, 0, 0, 0.87);
        font-size: 16px;
      }
    `,
  ],
})
export class ProjectDialogComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private dialogRef = inject(MatDialogRef<ProjectDialogComponent>);

  public data: Project | null = inject(MAT_DIALOG_DATA);

  colorModel: string = this.data?.color ?? '#e5e7eb';

  presets: string[] = [
    '#4f46e5',
    '#10b981',
    '#ef4444',
    '#f59e0b',
    '#6366f1',
    '#06b6d4',
    '#a855f7',
    '#374151',
    '#111827',
    '#22c55e',
    '#eab308',
    '#f97316',
  ];

  form = this.fb.group({
    name: [
      this.data?.name ?? '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(120)],
    ],
    description: [this.data?.description ?? null, [Validators.maxLength(2000)]],
    color: [this.data?.color ?? null, [Validators.maxLength(32)]],
    pinned: [this.data?.pinned ?? false],
  });

  onColorChange(hex: string) {
    this.colorModel = hex;
    this.form.patchValue({ color: hex || null });
    this.form.markAsDirty();
  }

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

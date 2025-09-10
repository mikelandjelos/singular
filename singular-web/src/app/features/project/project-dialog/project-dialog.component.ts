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
  templateUrl: './project-dialog.component.html',
  styleUrls: ['./project-dialog.component.scss'],
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

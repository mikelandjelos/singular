import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { selectAuthUser } from '../../auth/state';
import { UserActions, selectUserSaving } from '../state';
import { map, filter, take } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-edit-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  templateUrl: './edit-personal.info.component.html',
  styleUrl: './edit-personal-info.component.scss',
})
export class EditPersonalInfoComponent implements OnInit {
  private store = inject<Store<AppState>>(Store);
  private fb = inject<NonNullableFormBuilder>(NonNullableFormBuilder);

  readonly saving$ = this.store.select(selectUserSaving);
  readonly user$ = this.store.select(selectAuthUser);

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  form = this.fb.group({
    displayName: this.fb.control<string>('', {
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    firstName: this.fb.control<string>('', { validators: [Validators.maxLength(50)] }),
    lastName: this.fb.control<string>('', { validators: [Validators.maxLength(50)] }),
    headline: this.fb.control<string>(''),
    phone: this.fb.control<string>(''),
    location: this.fb.control<string>(''),
    website: this.fb.control<string>(''),
    summaryMd: this.fb.control<string>(''),
    skills: this.fb.control<string[]>([]),
    languages: this.fb.control<string[]>([]),
    links: this.fb.array<
      FormGroup<{
        label: FormControl<string>;
        url: FormControl<string>;
      }>
    >([]),
  });

  get linksFA(): FormArray<FormGroup<{ label: FormControl<string>; url: FormControl<string> }>> {
    return this.form.controls.links;
  }

  ngOnInit(): void {
    // Initialize form values from auth.user once
    this.user$
      .pipe(
        filter((u): u is NonNullable<typeof u> => !!u),
        take(1),
        map((u) => {
          this.form.patchValue({
            displayName: u.displayName ?? '',
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            headline: u.headline ?? '',
            phone: u.phone ?? '',
            location: u.location ?? '',
            website: u.website ?? '',
            summaryMd: u.summaryMd ?? '',
            skills: u.skills ?? [],
            languages: u.languages ?? [],
          });

          // build links
          this.linksFA.clear();
          (u.links ?? []).forEach((l) => {
            this.linksFA.push(
              this.fb.group({
                label: this.fb.control<string>(l.label ?? '', {
                  validators: [Validators.required],
                }),
                url: this.fb.control<string>(l.url ?? '', { validators: [Validators.required] }),
              }),
            );
          });
        }),
      )
      .subscribe();
  }

  addSkill(evt: MatChipInputEvent) {
    const value = (evt.value || '').trim();
    if (!value) return;
    const skills = [...this.form.controls.skills.value];
    if (!skills.includes(value)) skills.push(value);
    this.form.controls.skills.setValue(skills);
    evt.chipInput?.clear();
  }

  removeSkill(skill: string) {
    const skills = this.form.controls.skills.value.filter((s) => s !== skill);
    this.form.controls.skills.setValue(skills);
  }

  addLanguage(evt: MatChipInputEvent) {
    const value = (evt.value || '').trim();
    if (!value) return;
    const languages = [...this.form.controls.languages.value];
    if (!languages.includes(value)) languages.push(value);
    this.form.controls.languages.setValue(languages);
    evt.chipInput?.clear();
  }
  removeLanguage(lang: string) {
    const languages = this.form.controls.languages.value.filter((s) => s !== lang);
    this.form.controls.languages.setValue(languages);
  }

  addLink() {
    this.linksFA.push(
      this.fb.group({
        label: this.fb.control<string>('', { validators: [Validators.required] }),
        url: this.fb.control<string>('', { validators: [Validators.required] }),
      }),
    );
  }
  removeLink(i: number) {
    this.linksFA.removeAt(i);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.user$.pipe(take(1)).subscribe((u) => {
      if (!u) return;
      this.store.dispatch(
        UserActions.update({
          id: u.id,
          changes: {
            ...this.form.getRawValue(),
          },
        }),
      );
    });
  }
}

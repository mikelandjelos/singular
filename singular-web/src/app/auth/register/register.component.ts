import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RegisterDto } from '../../core/types/';
import { Store } from '@ngrx/store';
import { AuthActions, selectAuthLoading } from '../state';
import { AppState } from '../../app.state';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnDestroy {
  store = inject<Store<AppState>>(Store);
  private readonly componentDestroyed = new Subject<void>();

  pending = signal(false);

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    displayName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    firstName: new FormControl<string | null>(null),
    lastName: new FormControl<string | null>(null),
  });

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  submit() {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }
    this.pending.set(true);

    const registerParams: RegisterDto = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
      displayName: this.form.controls.displayName.value,
      firstName: this.form.controls.firstName.value || undefined,
      lastName: this.form.controls.lastName.value || undefined,
    };

    this.store.dispatch(
      AuthActions.register({
        registerParams,
      }),
    );

    this.store
      .select(selectAuthLoading)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((loading) => loading || this.pending.set(false));
  }
}

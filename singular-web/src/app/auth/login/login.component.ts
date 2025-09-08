import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginDto } from '../../core/types/';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { AuthActions, selectAuthLoading } from '../state';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private readonly store = inject<Store<AppState>>(Store);
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
  });

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  submit() {
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);

    const loginParams: LoginDto = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
    };

    this.store.dispatch(
      AuthActions.login({
        loginParams,
      }),
    );

    this.store
      .select(selectAuthLoading)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((loading) => loading || this.pending.set(false));
  }
}

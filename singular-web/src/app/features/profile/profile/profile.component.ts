import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { selectAuthUser, AuthActions } from '../../auth/state';
import { MarkdownModule } from 'ngx-markdown';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { delay } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MarkdownModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private store = inject<Store<AppState>>(Store);
  user$ = this.store.select(selectAuthUser).pipe(delay(1000));

  refresh() {
    this.store.dispatch(AuthActions.loadMe());
  }
}

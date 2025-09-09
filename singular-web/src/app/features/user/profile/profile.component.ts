import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { AppState } from '../../../app.state';
import { selectAuthUser, AuthActions } from '../../auth/state';
import { UserActions, selectUserSaving } from '../state';
import { MarkdownModule } from 'ngx-markdown';
import { combineLatest, map } from 'rxjs';

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
    MatProgressSpinnerModule,
    MarkdownModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private store = inject<Store<AppState>>(Store);

  user$ = this.store.select(selectAuthUser);
  saving$ = this.store.select(selectUserSaving);

  viewModel$ = combineLatest([this.user$, this.saving$]).pipe(map(([user, saving]) => ({ user, saving })));

  refresh() {
    this.store.dispatch(AuthActions.loadMe());
  }

  softDelete(userId?: string) {
    if (!userId) return;
    if (!confirm('Archive your account? You can restore later.')) return;
    this.store.dispatch(UserActions.softDelete({ id: userId }));
  }

  restore(userId?: string) {
    if (!userId) return;
    this.store.dispatch(UserActions.restore({ id: userId }));
  }

  hardDelete(userId?: string) {
    if (!userId) return;
    const sure = prompt('Type DELETE to permanently remove your account:');
    if (sure !== 'DELETE') return;
    this.store.dispatch(UserActions.hardDelete({ id: userId }));
  }
}

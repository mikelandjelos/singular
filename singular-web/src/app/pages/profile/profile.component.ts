import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { selectAuthUser } from '../../auth/state';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-4">
      <h2>My Profile</h2>
      <pre>{{ user$ | async | json }}</pre>
    </section>
  `,
})
export class ProfileComponent {
  private store = inject<Store<AppState>>(Store);
  user$ = this.store.select(selectAuthUser);
}

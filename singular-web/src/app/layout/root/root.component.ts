import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { AuthActions, selectAuthUser } from '../../auth/state';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrl: './root.component.scss',
  imports: [
    CommonModule,
    RouterOutlet, // TODO: careful with multiple router outlets
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
  ],
})
export class RootComponent {
  private store = inject<Store<AppState>>(Store);
  user$ = this.store.select(selectAuthUser);

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { AuthActions } from '../../auth/state';
import { RouterLink, RouterOutlet } from '@angular/router';
import { selectRouteParam } from '../../core/state';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrl: './root.component.scss',
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterLink,
  ],
})
export class RootComponent {
  private store = inject<Store<AppState>>(Store);

  userId$ = this.store.select(selectRouteParam('id'));

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}

import { Component, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { AuthActions } from '../../auth/state';
import { RouterLink, RouterOutlet } from '@angular/router';
import { selectRouteParam } from '../../core/state';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
    MatDividerModule,
    RouterLink,
  ],
})
export class RootComponent {
  private readonly store = inject<Store<AppState>>(Store);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly drawer = viewChild.required<MatSidenav>('drawer');

  userId$ = this.store.select(selectRouteParam('id'));

  isSmallScreen = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.XSmall])
      .pipe(map((result) => result.matches)),
  );

  closeDrawer() {
    console.log();
    this.drawer().close();
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}

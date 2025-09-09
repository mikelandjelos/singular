import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { AuthActions } from './features/auth/state';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('singular-web');
  private readonly store = inject<Store<AppState>>(Store);

  constructor() {
    this.store.dispatch(AuthActions.loadMe());
  }
}

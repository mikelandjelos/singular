import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-not-found',
  template: `
    <div class="nf">
      <h2>404 – Page not found</h2>
      <button mat-stroked-button routerLink="/login">Go Back</button>
    </div>
  `,
  styles: [
    `
      .nf {
        display: grid;
        place-items: center;
        height: 70vh;
        gap: 1rem;
      }
    `,
  ],
  imports: [RouterLink, MatButtonModule],
})
export class NotFoundComponent {}

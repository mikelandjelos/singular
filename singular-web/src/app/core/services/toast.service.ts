import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private snack = inject(MatSnackBar);

  show(message: string, action = 'OK', config: MatSnackBarConfig = {}) {
    this.snack.open(message, action, { duration: 2500, ...config });
  }
  success(message: string) {
    this.show(message, 'OK', { panelClass: ['snack-success'] });
  }
  error(message: string) {
    this.show(message, 'Close', { panelClass: ['snack-error'], duration: 3500 });
  }
}

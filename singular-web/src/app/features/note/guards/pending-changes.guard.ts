import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { NoteEditComponent } from '../edit/note-edit.component';

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<NoteEditComponent> {
  canDeactivate(component: NoteEditComponent): boolean {
    if (component.canDeactivate()) return true;
    return confirm('You have unsaved changes. Leave this page?');
  }
}

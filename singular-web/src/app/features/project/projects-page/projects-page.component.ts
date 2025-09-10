import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Store } from '@ngrx/store';
import { Project } from '../../../core/types';
import { ProjectActions } from '../state/project.actions';
import {
  selectArchived,
  selectPaging,
  selectProjectLoading,
  selectProjectTotal,
  selectProjects,
} from '../state/project.selectors';
import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';

@Component({
  standalone: true,
  selector: 'app-projects-page',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="header">
      <h2>Projects</h2>
      <span class="spacer"></span>
      <button mat-flat-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>&nbsp;New Project
      </button>
    </div>

    <div class="filters">
      <mat-form-field class="search" appearance="outline">
        <mat-label>Search projects</mat-label>
        <input
          matInput
          [(ngModel)]="q"
          (ngModelChange)="onQueryChange($event)"
          placeholder="name or description"
        />
        @if (q) {
          <button matSuffix mat-icon-button aria-label="Clear" (click)="onQueryChange(''); q = ''">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <span class="spacer"></span>

      <mat-slide-toggle [checked]="archived()" (change)="toggleArchived($event.checked)">
        Show archived
      </mat-slide-toggle>
    </div>

    <div class="table-wrap">
      <table mat-table [dataSource]="projects()">
        <!-- Pinned -->
        <ng-container matColumnDef="pinned">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            <button
              mat-icon-button
              class="pin-btn"
              [color]="p.pinned ? 'primary' : undefined"
              [class.is-pinned]="p.pinned"
              [matTooltip]="p.pinned ? 'Unpin' : 'Pin'"
              (click)="togglePin(p)"
            >
              <mat-icon>push_pin</mat-icon>
            </button>
          </td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let p">
            <div class="name-block">
              <div class="title">{{ p.name }}</div>
              @if (p.description) {
                <div class="desc">{{ p.description }}</div>
              }
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="updatedAt">
          <th mat-header-cell *matHeaderCellDef>Updated</th>
          <td mat-cell *matCellDef="let p">{{ p.updatedAt | date: 'medium' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            <button mat-icon-button matTooltip="Edit" (click)="openEditDialog(p)">
              <mat-icon>edit</mat-icon>
            </button>

            @if (!archived()) {
              <button mat-icon-button matTooltip="Archive" (click)="archive(p)">
                <mat-icon>archive</mat-icon>
              </button>
            } @else {
              <button mat-icon-button matTooltip="Restore" (click)="restore(p)">
                <mat-icon>unarchive</mat-icon>
              </button>
            }

            <button
              mat-icon-button
              color="warn"
              matTooltip="Delete forever"
              (click)="hardDelete(p)"
            >
              <mat-icon>delete_forever</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: cols"
          [ngStyle]="rowStyle(row)"
          [class.row-pinned]="row.pinned"
        ></tr>
      </table>

      <mat-paginator
        [length]="total()"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[10, 20, 50, 100]"
        (page)="onPage($event)"
      >
      </mat-paginator>
    </div>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }
      .spacer {
        flex: 1;
      }

      .filters {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
      }
      .filters .search {
        flex: 1;
        min-width: 420px;
        max-width: 760px;
      }

      .table-wrap {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
      }
      table {
        width: 100%;
      }

      .pin-btn.is-pinned mat-icon {
        transform: rotate(-35deg);
        transition: transform 0.12s ease;
      }
      .pin-btn mat-icon {
        opacity: 0.65;
      }
      .pin-btn.is-pinned mat-icon {
        opacity: 1;
      }

      .name-block {
        display: flex;
        flex-direction: column;
      }
      .title {
        font-weight: 600;
        line-height: 1.25;
      }
      .desc {
        color: rgba(0, 0, 0, 0.64);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 64ch;
      }

      .row-pinned {
        outline: 1px solid rgba(0, 0, 0, 0.08);
      }
    `,
  ],
})
export class ProjectsPageComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  cols = ['pinned', 'name', 'updatedAt', 'actions'] as const;

  projects = this.store.selectSignal(selectProjects);
  total = this.store.selectSignal(selectProjectTotal);
  loading = this.store.selectSignal(selectProjectLoading);
  archived = this.store.selectSignal(selectArchived);
  paging = this.store.selectSignal(selectPaging);

  q = '';

  ngOnInit() {
    this.store.dispatch(ProjectActions.loadPage());
  }

  pageIndex = () => Math.floor((this.paging().offset || 0) / (this.paging().limit || 20));
  pageSize = () => this.paging().limit || 20;

  onPage(e: PageEvent) {
    this.store.dispatch(
      ProjectActions.setPaging({ offset: e.pageIndex * e.pageSize, limit: e.pageSize }),
    );
  }

  onQueryChange(q: string) {
    this.store.dispatch(ProjectActions.setQuery({ q }));
  }

  toggleArchived(val: boolean) {
    this.store.dispatch(ProjectActions.setArchived({ archived: val }));
  }

  openCreateDialog() {
    this.dialog.open(ProjectDialogComponent, { data: null, width: '560px' });
  }

  openEditDialog(p: Project) {
    this.dialog.open(ProjectDialogComponent, { data: p, width: '560px' });
  }

  togglePin(p: Project) {
    this.store.dispatch(ProjectActions.pin({ id: p.id, pinned: !p.pinned }));
  }

  archive(p: Project) {
    this.store.dispatch(ProjectActions.softDelete({ id: p.id }));
  }
  restore(p: Project) {
    this.store.dispatch(ProjectActions.restore({ id: p.id }));
  }
  hardDelete(p: Project) {
    this.store.dispatch(ProjectActions.hardDelete({ id: p.id }));
  }

  private hexToRgba(hex: string, alpha: number): string {
    if (!hex) return 'transparent';
    const h = hex.replace('#', '');
    const to = (s: string) => parseInt(s, 16);
    const r = h.length === 3 ? to(h[0] + h[0]) : to(h.substring(0, 2));
    const g = h.length === 3 ? to(h[1] + h[1]) : to(h.substring(2, 4));
    const b = h.length === 3 ? to(h[2] + h[2]) : to(h.substring(4, 6));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  rowStyle(p: Project) {
    if (!p?.color) return {};
    const bg = this.hexToRgba(p.color, p.pinned ? 0.14 : 0.08); // a bit stronger when pinned
    const border = p.color;
    return {
      background: bg,
      boxShadow: `inset 8px 0 0 ${border}`,
    };
  }
}

import { Component, OnInit, computed, inject } from '@angular/core';
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
  templateUrl: './projects-page.component.html',
  styleUrls: [`./projects-page.component.scss`],
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

  displayedCols = computed(() =>
    this.archived()
      ? ['pinned', 'name', 'updatedAt', 'status', 'actions']
      : ['pinned', 'name', 'updatedAt', 'actions'],
  );

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

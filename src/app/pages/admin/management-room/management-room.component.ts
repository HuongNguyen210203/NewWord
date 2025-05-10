import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-management-room',
  standalone: true,
  templateUrl: './management-room.component.html',
  styleUrls: ['./management-room.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatSidenavContainer,
    MatSidenavContent,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TopbarComponent,
    SidebarComponent
  ]
})
export class ManagementRoomComponent {
  searchTerm: string = '';

  displayedColumns: string[] = ['select', 'image', 'name', 'description', 'createdAt', 'members'];

  dataSource = Array.from({ length: 10 }).map((_, i) => ({
    image: 'https://m.yodycdn.com/products/anhthobaymau14_m3o64um60zyfvvlu2ltf.jpg',
    name: `Room ${i + 1}`,
    description: 'Lorem Ipsum Dolor Sit Amet',
    createdAt: new Date(),
    members: Math.floor(Math.random() * 100 + 1)
  }));

  get filteredData() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.dataSource.filter(row =>
      row.name.toLowerCase().includes(term) ||
      row.description.toLowerCase().includes(term)
    );
  }

  selection = {
    selected: [] as any[],
    toggle(row: any) {
      const index = this.selected.indexOf(row);
      index === -1 ? this.selected.push(row) : this.selected.splice(index, 1);
    },
    isSelected(row: any) {
      return this.selected.includes(row);
    },
    hasValue() {
      return this.selected.length > 0;
    }
  };

  isAllSelected(): boolean {
    return this.selection.selected.length === this.filteredData.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.filteredData]);
  }

  viewRoomDetail(row: any): void {
    alert(`Viewing details for room: ${row.name}`);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { SidebarComponent } from '../admin-page/components/sidebar/sidebar.component';
import {UserService} from '../../../../Services/user.service';
import {User} from '../../../../Models/user.model';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-management-profile',
  standalone: true,
  templateUrl: './management-profile.component.html',
  styleUrls: ['./management-profile.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggle,
  ]
})
export class ManagementProfileComponent implements OnInit {
  sidebarOpen = true;

  constructor(private dialog: MatDialog, private userService: UserService) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  dataSource: User[] = [];
  searchTerm = '';
  pageSize = 5;
  currentPageIndex = 0;

  displayedColumns: string[] = ['select', 'email', 'name', 'joinedRooms', 'events', 'actions'];

  async ngOnInit(): Promise<void> {
    this.dataSource = await this.userService.getAllUsers();
  }

  get filteredData(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.dataSource.filter(row =>
      row.email.toLowerCase().includes(term) ||
      row.name.toLowerCase().includes(term)
    );
  }

  get pagedData(): User[] {
    const startIndex = this.currentPageIndex * this.pageSize;
    return this.filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  onPageEvent(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
  }

  updatePaginator(): void {
    this.currentPageIndex = 0;
  }

  async toggleVisibility(row: User): Promise<void> {
    row.is_hidden = !row.is_hidden;
    try {
      await this.userService.updateVisibility(row.id, row.is_hidden);
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái người dùng');
      row.is_hidden = !row.is_hidden; // rollback
    }
  }

  selection = {
    selected: [] as User[],
    toggle(row: User) {
      const index = this.selected.indexOf(row);
      index === -1 ? this.selected.push(row) : this.selected.splice(index, 1);
    },
    isSelected(row: User) {
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

  exportCSV(): void {
    const rows = [
      ['Email', 'Name', 'Joined Rooms', 'Events'],
      ...this.filteredData.map(row => [row.email, row.name, row.joinedRooms, row.events])
    ];
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'user_profiles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  truncateText(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > maxWords
      ? words.slice(0, maxWords).join(' ') + '...'
      : text;
  }
}

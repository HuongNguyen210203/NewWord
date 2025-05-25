import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { SidebarComponent } from '../admin-page/components/sidebar/sidebar.component';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileDialogComponent} from './components/edit-profile-dialog/edit-profile-dialog.component';
import { CreateProfileComponent } from '../../../dialog/create-profile/create-profile.component';

@Component({
  selector: 'app-management-profile',
  standalone: true,
  templateUrl: './management-profile.component.html',
  styleUrls: ['./management-profile.component.css'],
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
    SidebarComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ]
})
export class ManagementProfileComponent {

  constructor(private dialog: MatDialog) {}

  searchTerm: string = '';
  displayedColumns: string[] = ['select', 'email', 'name', 'joinedRooms', 'events', 'actions'];
  dataSource = Array.from({ length: 10 }).map((_, i) => ({
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    joinedRooms: Math.floor(Math.random() * 50 + 50),
    events: Math.floor(Math.random() * 10 + 1)
  }));

  pageSize = 3;
  currentPageIndex = 0;

  get filteredData() {
    const term = this.searchTerm.trim().toLowerCase();
    return this.dataSource.filter(row =>
      row.email.toLowerCase().includes(term) ||
      row.name.toLowerCase().includes(term)
    );
  }

  get pagedData() {
    const startIndex = this.currentPageIndex * this.pageSize;
    return this.filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  onPageEvent(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
  }

  openCreateProfile(): void {
    const dialogRef = this.dialog.open(CreateProfileComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.unshift(result);
        this.dataSource = [...this.dataSource];
        this.updatePaginator();
      }
    });
  }

  updatePaginator(): void {
    this.currentPageIndex = 0;
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

  exportCSV(): void {
    const rows = [
      ['Email', 'Name', 'Joined Rooms', 'Events'],
      ...this.filteredData.map(row => [row.email, row.name, row.joinedRooms, row.events])
    ];
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_profiles.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewUserDetail(row: any): void {
    alert(`Viewing details for: ${row.name} (${row.email})`);
  }

  editUser(row: any) {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '500px',
      data: { ...row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.findIndex(user => user.email === row.email);
        if (index !== -1) {
          this.dataSource[index] = result;
          this.dataSource = [...this.dataSource];
        }
      }
    });
  }

  deleteUser(row: any) {
    const confirmed = confirm(`Are you sure to delete ${row.name}?`);
    if (confirmed) {
      this.dataSource = this.dataSource.filter(u => u !== row);
    }
  }
  truncateText(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > maxWords
      ? words.slice(0, maxWords).join(' ') + '...'
      : text;
  }

}

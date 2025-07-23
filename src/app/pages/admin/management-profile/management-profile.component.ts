import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
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
export class ManagementProfileComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'email', 'name', 'joinedRooms', 'events', 'actions'];
  dataSource = new MatTableDataSource<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Optional: Custom sort for string fields
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'email':
          return item.email?.toLowerCase();
        case 'name':
          return item.name?.toLowerCase();
        case 'joinedRooms':
        case 'events':
          return Number(item[property as keyof User]) || 0;
        default:
          return (item as any)[property];
      }
    };
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      this.dataSource.data = users;
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    const filterWords = filterValue.split(/\s+/);

    this.dataSource.filterPredicate = (data, filter: string) => {
      const combinedData = `${data.name} ${data.email}`.toLowerCase();


      return filterWords.some(word => combinedData.includes(word));
    };

    this.dataSource.filter = filterValue;
  }


  truncateText(text: string, limit: number): string {
    return text?.length > limit ? text.substring(0, limit) + '...' : text;
  }

  toggleVisibility(user: User): void {
    user.is_hidden = !user.is_hidden;
    this.userService.updateVisibility(user.id, user.is_hidden)
  }


  selection = {
    selected: [] as User[],
    toggle: (row: User) => {
      const idx = this.selection.selected.indexOf(row);
      idx === -1 ? this.selection.selected.push(row) : this.selection.selected.splice(idx, 1);
    },
    isSelected: (row: User) => this.selection.selected.includes(row),
    hasValue: () => this.selection.selected.length > 0
  };

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.filteredData.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.dataSource.filteredData]);
  }
}

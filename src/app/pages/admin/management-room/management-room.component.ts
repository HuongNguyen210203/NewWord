import {Component, AfterViewInit, ViewChild, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
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
import { EditRoomDialogComponent} from './components/edit-room-dialog/edit-room-dialog.component';
import { CreateRoomComponent} from '../../../dialog/create-room/create-room.component';

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
    SidebarComponent,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem
  ]
})
export class ManagementRoomComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  sidebarOpen = true;
  searchTerm: string = '';

  displayedColumns: string[] = ['select', 'image', 'name', 'description', 'createdAt', 'members', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    const rooms = Array.from({ length: 10 }).map((_, i) => ({
      image: 'https://m.yodycdn.com/products/anhthobaymau14_m3o64um60zyfvvlu2ltf.jpg',
      name: `Room ${i + 1}`,
      description: 'Lorem Ipsum Dolor Sit Amet',
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24), // mỗi room cách nhau 1 ngày
      members: Math.floor(Math.random() * 100 + 1)
    }));

    // sắp xếp từ mới đến cũ
    rooms.sort((a, b) => +b.createdAt - +a.createdAt);
    this.dataSource.data = rooms;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedData = [result, ...this.dataSource.data];
        updatedData.sort((a, b) => +b.createdAt - +a.createdAt);
        this.dataSource.data = updatedData;
      }
    });
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
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.dataSource.data]);
  }

  viewRoomDetail(row: any): void {
    alert(`Viewing details for room: ${row.name}`);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }


  editRoom(row: any): void {
    const dialogRef = this.dialog.open(EditRoomDialogComponent, {
      width: '600px',
      data: { ...row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.data.indexOf(row);
        if (index !== -1) {
          this.dataSource.data[index] = result;
          this.dataSource.data = [...this.dataSource.data];
        }
      }
    });
  }

  deleteRoom(row: any): void {
    const confirmDelete = confirm(`Are you sure you want to delete room "${row.name}"?`);
    if (confirmDelete) {
      this.dataSource.data = this.dataSource.data.filter(item => item !== row);
    }
  }
}

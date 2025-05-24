import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { supabase } from '../../../supabase.client';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';

import { SidebarComponent } from '../admin-page/components/sidebar/sidebar.component';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { CreateRoomComponent } from '../../../dialog/create-room/create-room.component';
import { EditRoomDialogComponent } from './components/edit-room-dialog/edit-room-dialog.component';
import {FormsModule} from '@angular/forms';
import {MatSortModule} from '@angular/material/sort';

@Component({
  selector: 'app-management-room',
  standalone: true,
  templateUrl: './management-room.component.html',
  styleUrls: ['./management-room.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatMenuModule,
    SidebarComponent,
    TopbarComponent
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
    this.loadRoomsFromSupabase();
  }


  async loadRoomsFromSupabase() {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi khi tải phòng:', error);
      return;
    }

    this.dataSource.data = (data || []).map(room => ({
      ...room,
      image: room.image_url,
      createdAt: new Date(room.created_at),
      members: room.members ?? 0
    }));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  get roomList() {
    return this.dataSource?.data ?? [];
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

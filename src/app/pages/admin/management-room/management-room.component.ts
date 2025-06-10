
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { FormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ChatService } from '../../../../Services/chat.service';
import { Router } from '@angular/router';

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
  ]
})
export class ManagementRoomComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  sidebarOpen = true;
  searchTerm: string = '';
  displayedColumns: string[] = [
    'select',
    'image',
    'name',
    'description',
    'createdAt',
    'members',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private dialog: MatDialog,
    private chatService: ChatService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadRoomsFromSupabase();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Optional: custom filter function based on name or description
    this.dataSource.filterPredicate = (data, filter) => {
      const name = data.name?.toLowerCase() || '';
      const desc = data.description?.toLowerCase() || '';
      return name.includes(filter) || desc.includes(filter);
    };
  }

  async loadRoomsFromSupabase() {
    try {
      const rooms = await this.chatService.getAllRooms();
      this.dataSource.data = rooms.map(room => ({
        ...room,
        created_at: new Date(room.created_at || ''),
        is_hidden: room.is_hidden ?? false,
      }));
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    }
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
        updatedData.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        this.dataSource.data = updatedData;
      }
    });
  }

  // Checkbox logic
  selection = {
    selected: [] as any[],
    toggle: (row: any) => {
      const index = this.selection.selected.indexOf(row);
      index === -1
        ? this.selection.selected.push(row)
        : this.selection.selected.splice(index, 1);
    },
    isSelected: (row: any) => {
      return this.selection.selected.includes(row);
    },
    hasValue: () => {
      return this.selection.selected.length > 0;
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
        const index = this.dataSource.data.findIndex(r => r.id === result.id);
        if (index !== -1) {
          this.dataSource.data[index] = result;
          this.dataSource.data = [...this.dataSource.data];
        }
      }
    });
  }

  async deleteRoom(row: any): Promise<void> {
    const confirmDelete = confirm(`Are you sure you want to delete room "${row.name}"?`);
    if (confirmDelete) {
      try {
        await this.chatService.deleteRoom(row.id); // Xoá trên Supabase
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== row.id); // Xoá trên giao diện
      }
      catch (error) {
        console.error('Delete room error:', error);
        let message = 'Unknown error';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
          message = (error as any).message;
        }
        alert('Failed to delete room: ' + message);
      }
    }
  }

  truncateText(text: string, wordLimit: number = 40): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  }

  get roomList() {
    return this.dataSource.data;
  }
}

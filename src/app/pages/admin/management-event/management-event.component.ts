import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { SidebarComponent } from '../admin-page/components/sidebar/sidebar.component';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';

import { CreateEventComponent } from '../../../dialog/create-event/create-event.component';
import { EditEventDialogComponent } from './components/edit-event-dialog/edit-event-dialog.component';

import { EventService } from '../../../../Services/event.service';
import { AppEvent } from '../../../../Models/event.model';

@Component({
  selector: 'app-management-event',
  standalone: true,
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    TopbarComponent,
    SidebarComponent,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
  ]
})
export class ManagementEventComponent implements OnInit {
  dataSource: AppEvent[] = [];
  displayedColumns: string[] = [
    'select',
    'image',
    'name',
    'description',
    'registerStart',
    'registerEnd',
    'eventDate',
    'participants',
    'actions',
  ];

  searchTerm: string = '';
  pageSize = 3;
  pageIndex = 0;
  pageSizeOptions = [3, 5, 10];

  sidebarOpen = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadEventsFromSupabase();
  }

  async loadEventsFromSupabase() {
    try {
      const events = await this.eventService.getAllEvents();
      this.dataSource = events.map(event => ({
        ...event,
        image: event.image_url,
        participants: 0,
        registerStart: new Date(event.registration_deadline),
        registerEnd: new Date(event.end_time),
        eventDate: new Date(event.start_time)
      }));
    } catch (error) {
      console.error('Lỗi khi tải sự kiện:', error);
    }
  }

  get filteredData() {
    const filtered = this.dataSource.filter(item =>
      item.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;

    return filtered.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  truncateText(text: string | undefined, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEventComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;

      try {
        const created = await this.eventService.createEvent(result);

        this.dataSource = [
          {
            ...(created as any),
            image: created.image_url,
            registerStart: new Date(created.start_time),
            registerEnd: new Date(created.end_time),
            eventDate: new Date(created.registration_deadline),
            participants: 0
          },
          ...this.dataSource,
        ];
      } catch (error) {
        console.error('Lỗi khi tạo sự kiện:', error);
        alert('Không thể tạo sự kiện. Vui lòng thử lại.');
      }
    });
  }

  openEditDialog(event: AppEvent): void {
    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '800px',
      data: {
        ...event,
        startDate: new Date(event.start_time),
        startTime: this.formatTime(event.start_time),
        endDate: new Date(event.end_time),
        endTime: this.formatTime(event.end_time),
        registerDeadline: new Date(event.registration_deadline),
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          const updated = await this.eventService.updateEvent(event.id, result);
          const index = this.dataSource.findIndex(e => e.id === event.id);
          if (index !== -1) {
            this.dataSource[index] = { ...this.dataSource[index], ...updated };
            this.dataSource = [...this.dataSource];
          }
        } catch (err) {
          alert('Cập nhật thất bại.');
        }
      }
    });
  }

  deleteEvent(event: AppEvent): void {
    const confirmed = confirm(`Bạn có chắc muốn xoá sự kiện "${event.title}"?`);
    if (!confirmed) return;

    this.eventService.deleteEvent(event.id).then(() => {
      this.dataSource = this.dataSource.filter(e => e.id !== event.id);
    }).catch(() => alert('Xoá thất bại.'));
  }

  // Selection logic
  selection = {
    selected: [] as AppEvent[],
    toggle: (row: AppEvent) => {
      const idx = this.selection.selected.indexOf(row);
      idx === -1 ? this.selection.selected.push(row) : this.selection.selected.splice(idx, 1);
    },
    isSelected: (row: AppEvent) => this.selection.selected.includes(row),
    hasValue: () => this.selection.selected.length > 0
  };

  isAllSelected(): boolean {
    return this.selection.selected.length === this.filteredData.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.filteredData]);
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

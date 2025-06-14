import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
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
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-management-event',
  standalone: true,
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css'],
  imports: [
    CommonModule,
    FormsModule,
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


export class ManagementEventComponent implements OnInit, AfterViewInit, OnDestroy {
  sidebarOpen = true;
  dataSource = new MatTableDataSource<AppEvent & {
    title: string,
    participants: number,
    registerStart: Date,
    eventDate: Date,
    registerEnd: Date
  }>();

  displayedColumns: string[] = [
    'select',
    'image',
    'title',
    'description',
    'registerStart',
    'eventDate',
    'registerEnd',
    'participants',
    'actions',
  ];
  pageSize = 5;
  pageIndex = 0;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadEventsFromSupabase();

    this.eventService.subscribeToEvents(() => {
      this.loadEventsFromSupabase();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'participants':
          return item.participants ?? 0;

        case 'title':
          return item.title?.toLowerCase() || '';

        case 'description':
          return item.description?.toLowerCase() || '';

        case 'registerStart':
          return item.registerStart?.getTime?.() || new Date(item.registerStart).getTime();

        case 'eventDate':
          return item.eventDate?.getTime?.() || new Date(item.eventDate).getTime();

        case 'registerEnd':
          return item.registerEnd?.getTime?.() || new Date(item.registerEnd).getTime();

        default:
          return (item as any)[property];
      }
    };
  }

  ngOnDestroy(): void {
    this.eventService.unsubscribeEvents();
  }

  async loadEventsFromSupabase() {
    try {
      const events = await this.eventService.getAllEvents();
      this.dataSource.data = events.map(event => ({
        ...event,
        image: event.image_url,
        title: event.title || '',
        is_hidden: event.is_hidden ?? false,
        registerStart: new Date(event.registration_deadline),
        registerEnd: new Date(event.end_time),
        eventDate: new Date(event.start_time),
        participants: Number(event.current_participants) || 0
      }));
    } catch (error) {
      console.error('Lỗi khi tải sự kiện:', error);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
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
        await this.eventService.createEvent(result);
        await this.loadEventsFromSupabase();
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
        participants: event.max_participants || 0,
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
          await this.eventService.updateEvent(event.id, result);
          await this.loadEventsFromSupabase();
        } catch (err) {
          console.error('Cập nhật thất bại:', err);
          alert('Cập nhật thất bại.');
        }
      }
    });
  }

  deleteEvent(event: AppEvent): void {
    const confirmed = confirm(`Bạn có chắc muốn xoá sự kiện "${event.title}"?`);
    if (!confirmed) return;

    this.eventService.deleteEvent(event.id).then(() => {
      this.dataSource.data = this.dataSource.data.filter((e: AppEvent) => e.id !== event.id);
    }).catch(() => alert('Xoá thất bại.'));
  }

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
    return this.selection.selected.length === this.dataSource.filteredData.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.dataSource.filteredData]);
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

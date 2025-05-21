
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SidebarComponent } from '../admin-page/components/sidebar/sidebar.component';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  MatSidenavModule,
  MatSidenavContainer,
  MatSidenavContent
} from '@angular/material/sidenav';
import {
  MatButton,
  MatIconButton
} from '@angular/material/button';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatCheckboxModule
} from '@angular/material/checkbox';
import {
  MatTableModule
} from '@angular/material/table';
import {
  MatPaginatorModule, PageEvent
} from '@angular/material/paginator';
import {
  MatSort
} from '@angular/material/sort';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger
} from '@angular/material/menu';

import { EditEventDialogComponent } from './components/edit-event-dialog/edit-event-dialog.component';
import { CreateEventComponent } from '../../../dialog/create-event/create-event.component';

@Component({
  selector: 'app-management-event',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    SidebarComponent,
    MatSidenavModule,
    MatSidenavContainer,
    MatSidenavContent,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatButton,
    MatSort,
    FormsModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatIconButton,
  ],
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css']
})
// export class ManagementEventComponent {
//   sidebarOpen = true;
//   searchTerm = '';
//   limitCount = 5;
//
//   displayedColumns = [
//     'select',
//     'image',
//     'name',
//     'description',
//     'registerStart',
//     'registerEnd',
//     'eventDate',
//     'participants',
//     'actions'
//   ];
//
//   dataSource = Array.from({ length: 8 }).map((_, i) => {
//     const base = new Date();
//     const start = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
//     const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
//
//     return {
//       id: i + 1,
//       image: 'https://upload.wikimedia.org/wikipedia/vi/5/56/Bia_truyen_Tho_bay_mau%2C_2022.webp',
//       name: `Event ${i + 1}`,
//       description: 'Sample event description',
//       registerStart: start,
//       registerEnd: end,
//       eventDate: new Date(start.getTime() + 86400000),
//       start: start,
//       end: end,
//       participants: Math.floor(Math.random() * 100 + 1)
//     };
//   });
//
//   selection: any = {
//     selected: [] as any[],
//     toggle: (row: any) => {
//       const index = this.selection.selected.indexOf(row);
//       index === -1 ? this.selection.selected.push(row) : this.selection.selected.splice(index, 1);
//     },
//     isSelected: (row: any) => this.selection.selected.includes(row),
//     hasValue: () => this.selection.selected.length > 0
//   };
//
//   constructor(private dialog: MatDialog) {}
//
//   toggleSidebar() {
//     this.sidebarOpen = !this.sidebarOpen;
//   }
//
//   isAllSelected(): boolean {
//     return this.selection.selected.length === this.filteredData.length;
//   }
//
//   masterToggle(): void {
//     this.isAllSelected()
//       ? (this.selection.selected = [])
//       : (this.selection.selected = [...this.filteredData]);
//   }
//
//   get filteredData() {
//     const keyword = this.searchTerm.toLowerCase();
//
//     return this.dataSource
//       .filter(event =>
//         event.name.toLowerCase().includes(keyword) ||
//         event.description.toLowerCase().includes(keyword)
//       )
//       .sort((a, b) => b.id - a.id);
//   }
//
//   formatTime(date: Date | string): string {
//     const d = new Date(date);
//     const hours = String(d.getHours()).padStart(2, '0');
//     const minutes = String(d.getMinutes()).padStart(2, '0');
//     return `${hours}:${minutes}`;
//   }
//
//   openEditDialog(event: any) {
//     const authenticated = confirm('Are you authenticated to modify?');
//     if (!authenticated) return;
//
//     const dialogRef = this.dialog.open(EditEventDialogComponent, {
//       width: '800px',
//       data: {
//         ...event,
//         startDate: new Date(event.start),
//         startTime: this.formatTime(event.start),
//         endDate: new Date(event.end),
//         endTime: this.formatTime(event.end),
//         eventDate: new Date(event.eventDate),
//       }
//     });
//
//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         const index = this.dataSource.findIndex(e => e.id === result.id);
//         if (index !== -1) {
//           this.dataSource[index] = {
//             ...this.dataSource[index],
//             ...result,
//             registerStart: result.start,
//             registerEnd: result.end,
//             eventDate: result.eventDate
//           };
//           this.dataSource = [...this.dataSource];
//         }
//       }
//     });
//   }
//
//   openCreateDialog() {
//     const dialogRef = this.dialog.open(CreateEventComponent, {
//       width: '800px'
//     });
//
//     dialogRef.afterClosed().subscribe(result => {
//       if (!result) return;
//
//       const newEvent = {
//         id: Date.now(), // đảm bảo duy nhất và mới nhất
//         image: result.image || 'https://via.placeholder.com/100x60',
//         name: result.title?.trim() || 'Untitled Event',
//         description: result.description?.trim() || 'No description provided.',
//         location: result.location?.trim() || 'Unknown',
//         registerStart: result.start,
//         registerEnd: result.end,
//         eventDate: result.registerDeadline,
//         start: result.start,
//         end: result.end,
//         participants: 0
//       };
//
//       this.dataSource = [newEvent, ...this.dataSource];
//     });
//   }
//
//
//   deleteEvent(row: any) {
//     const confirmed = confirm(`Are you sure to delete "${row.name}"?`);
//     if (confirmed) {
//       this.dataSource = this.dataSource.filter(item => item !== row);
//     }
//   }
// }
export class ManagementEventComponent {
  sidebarOpen = true;
  searchTerm = '';

  pageIndex = 0;
  pageSize = 5;
  readonly pageSizeOptions = [1, 3, 5];

  displayedColumns = [
    'select',
    'image',
    'name',
    'description',
    'registerStart',
    'registerEnd',
    'eventDate',
    'participants',
    'actions'
  ];

  dataSource = Array.from({ length: 8 }).map((_, i) => {
    const base = new Date();
    const start = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    return {
      id: i + 1,
      image: 'https://upload.wikimedia.org/wikipedia/vi/5/56/Bia_truyen_Tho_bay_mau%2C_2022.webp',
      name: `Event ${i + 1}`,
      description: 'Sample event description',
      registerStart: start,
      registerEnd: end,
      eventDate: new Date(start.getTime() + 86400000),
      start: start,
      end: end,
      participants: Math.floor(Math.random() * 100 + 1)
    };
  });

  selection: any = {
    selected: [] as any[],
    toggle: (row: any) => {
      const index = this.selection.selected.indexOf(row);
      index === -1 ? this.selection.selected.push(row) : this.selection.selected.splice(index, 1);
    },
    isSelected: (row: any) => this.selection.selected.includes(row),
    hasValue: () => this.selection.selected.length > 0
  };

  constructor(private dialog: MatDialog) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.filteredData.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.filteredData]);
  }

  get filteredData() {
    const keyword = this.searchTerm.toLowerCase();

    const sorted = this.dataSource
      .filter(event =>
        event.name.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword)
      )
      .sort((a, b) => b.id - a.id); // Mới nhất lên đầu

    const start = this.pageIndex * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  openEditDialog(event: any) {
    const authenticated = confirm('Are you authenticated to modify?');
    if (!authenticated) return;

    const dialogRef = this.dialog.open(EditEventDialogComponent, {
      width: '800px',
      data: {
        ...event,
        startDate: new Date(event.start),
        startTime: this.formatTime(event.start),
        endDate: new Date(event.end),
        endTime: this.formatTime(event.end),
        eventDate: new Date(event.eventDate),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.dataSource.findIndex(e => e.id === result.id);
        if (index !== -1) {
          this.dataSource[index] = {
            ...this.dataSource[index],
            ...result,
            registerStart: result.start,
            registerEnd: result.end,
            eventDate: result.eventDate
          };
          this.dataSource = [...this.dataSource];
        }
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEventComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const newEvent = {
        id: Date.now(),
        image: result.image || 'https://via.placeholder.com/100x60',
        name: result.title?.trim() || 'Untitled Event',
        description: result.description?.trim() || 'No description provided.',
        location: result.location?.trim() || 'Unknown',
        registerStart: result.start,
        registerEnd: result.end,
        eventDate: result.registerDeadline,
        start: result.start,
        end: result.end,
        participants: 0
      };

      this.dataSource = [newEvent, ...this.dataSource];
    });
  }

  deleteEvent(row: any) {
    const confirmed = confirm(`Are you sure to delete "${row.name}"?`);
    if (confirmed) {
      this.dataSource = this.dataSource.filter(item => item !== row);
    }
  }
}

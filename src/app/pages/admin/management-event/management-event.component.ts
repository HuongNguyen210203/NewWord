
import {Component, HostListener} from '@angular/core';
import { SidebarComponent} from '../admin-page/components/sidebar/sidebar.component';
import { TopbarComponent } from '../admin-page/components/topbar/topbar.component';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DatePipe, CommonModule } from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {EditEventDialogComponent} from './components/edit-event-dialog/edit-event-dialog.component';

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
    RouterLink,
    MatSort,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatSuffix,
    FormsModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css']
})

export class ManagementEventComponent {
  sidebarOpen = true;
  searchTerm = '';
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
    const start = new Date(base.getTime() + i * 24 * 60 * 60 * 1000); // cộng ngày
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 tiếng

    return {
      id: i + 1,
      image: 'https://upload.wikimedia.org/wikipedia/vi/5/56/Bia_truyen_Tho_bay_mau%2C_2022.webp',
      name: `Event ${i + 1}`,
      description: 'Sample event description',
      registerStart: start,
      registerEnd: end,
      eventDate: new Date(start.getTime() + 86400000), // hôm sau
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
    return this.dataSource.filter(event =>
      event.name.toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword)
    );
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
      console.log('Dialog returned:', result); // ✅ THÊM DÒNG NÀY

      if (result) {
        const index = this.dataSource.findIndex(e => e.id === result.id);
        console.log('Matched index:', index); // ✅ THÊM DÒNG NÀY

        if (index !== -1) {
          this.dataSource[index] = {
            ...this.dataSource[index],
            ...result,
            registerStart: result.start,
            registerEnd: result.end,
            eventDate: result.eventDate
          };
          this.dataSource = [...this.dataSource];
          console.log('Updated row:', this.dataSource[index]); // ✅ THÊM DÒNG NÀY
        }
      }
    });


  }



  deleteEvent(row: any) {
    const confirmed = confirm(`Are you sure to delete "${row.name}"?`);
    if (confirmed) {
      this.dataSource = this.dataSource.filter(item => item !== row);

      // // Supabase delete example
      // await supabase.from('events').delete().eq('id', row.id);
    }
  }
}

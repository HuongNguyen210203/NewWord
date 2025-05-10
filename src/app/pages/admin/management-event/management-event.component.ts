
import { Component } from '@angular/core';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DatePipe, CommonModule } from '@angular/common';

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
    MatPaginatorModule
  ],
  templateUrl: './management-event.component.html',
  styleUrls: ['./management-event.component.css']
})
export class ManagementEventComponent {
  displayedColumns: string[] = ['select', 'image', 'name', 'description', 'registerStart', 'registerEnd', 'eventDate', 'participants'];

  dataSource = Array.from({ length: 10 }).map((_, i) => ({
    image: 'https://upload.wikimedia.org/wikipedia/vi/5/56/Bia_truyen_Tho_bay_mau%2C_2022.webp',
    name: `Event ${i + 1}`,
    description: 'Sample event description',
    registerStart: new Date(),
    registerEnd: new Date(),
    eventDate: new Date(),
    participants: Math.floor(Math.random() * 100 + 1)
  }));

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
    return this.selection.selected.length === this.dataSource.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? (this.selection.selected = [])
      : (this.selection.selected = [...this.dataSource]);
  }
}

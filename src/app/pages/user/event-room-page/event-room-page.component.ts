import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import {AppEvent} from '../../../../Models/event.model';
import {EventService} from '../../../../Services/event.service';
import {MatChip} from '@angular/material/chips';
import { MatChipsModule } from '@angular/material/chips';
import {MatDialog} from '@angular/material/dialog';
import {JoinEventDialogComponent} from '../../../dialog/join-event-dialog/join-event-dialog.component';
import {CreateEventComponent} from '../../../dialog/create-event/create-event.component';


@Component({
  selector: 'app-event-room-page',
  standalone: true,
  templateUrl: './event-room-page.component.html',
  styleUrls: ['./event-room-page.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatPaginatorModule,
    MatButtonModule,
    MatChipsModule
  ]
})
export class EventRoomPageComponent implements OnInit {
  searchTerm: string = '';
  selectedTag: string | null = null;
  availableTags: string[] = ['Vocabulary', 'Workshop', 'Debate', 'Speaking'];

  allEvents: AppEvent[] = [];
  filteredEvents: AppEvent[] = [];
  pagedEvents: AppEvent[] = [];

  currentPage: number = 0;
  cardsPerPage: number = 8;

  constructor(
    private eventService: EventService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.allEvents = await this.eventService.getAllEvents();
    this.filteredEvents = [...this.allEvents];
    this.updatePagedEvents();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredEvents = this.allEvents.filter(event =>
      event.title.toLowerCase().includes(term) &&
      (!this.selectedTag || event.title.toLowerCase().includes(this.selectedTag.toLowerCase()))
    );

    this.currentPage = 0;
    this.updatePagedEvents();
  }

  filterByTag(tag: string): void {
    this.selectedTag = tag;
    this.applyFilter();
  }

  clearFilter(): void {
    this.selectedTag = null;
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.cardsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedEvents();
  }

  updatePagedEvents(): void {
    const start = this.currentPage * this.cardsPerPage;
    const end = start + this.cardsPerPage;
    this.pagedEvents = this.filteredEvents.slice(start, end);
  }

  openDialog(card: any): void {
    this.dialog.open(JoinEventDialogComponent, {
      width: '500px',
      data: {
        title: card.title,
        imageUrl: card.image_url,
        description: card.description,
        date: card.start_time
      }
    });
  }

  async reloadEvents(): Promise<void> {
    this.allEvents = await this.eventService.getAllEvents();
    this.applyFilter();
  }


  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateEventComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.reloadEvents(); // làm mới sự kiện nếu có sự thay đổi
    });
  }

}

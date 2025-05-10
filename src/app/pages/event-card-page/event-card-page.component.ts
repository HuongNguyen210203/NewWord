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

import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

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
    MatButtonModule
  ]
})
export class EventRoomPageComponent implements OnInit {
  searchTerm: string = '';
  currentPage: number = 0;
  cardsPerPage: number = 12;

  cards: { title: string; peopleCount: number; eventCount: number }[] = Array.from({ length: 50 }).map((_, i) => ({
    title: `Event ${i + 1}`,
    peopleCount: Math.floor(Math.random() * 200 + 20),
    eventCount: Math.floor(Math.random() * 6 + 1)
  }));

  filteredCards: typeof this.cards = [...this.cards];
  pagedCards: typeof this.cards = [];

  ngOnInit(): void {
    this.updatePagedCards();
  }

  onPageChange(event: PageEvent): void {
    this.cardsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedCards();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCards = this.cards.filter(card =>
      card.title.toLowerCase().includes(term)
    );
    this.currentPage = 0;
    this.updatePagedCards();
  }

  updatePagedCards(): void {
    const start = this.currentPage * this.cardsPerPage;
    const end = start + this.cardsPerPage;
    this.pagedCards = this.filteredCards.slice(start, end);
  }
}

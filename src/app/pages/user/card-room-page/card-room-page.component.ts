
import { Component } from '@angular/core';
import { MatSidenavContainer, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-card-room-page',
  standalone: true,
  templateUrl: './card-room-page.component.html',
  styleUrls: ['./card-room-page.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatSidenavContainer,
    MatSidenavContent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatPaginatorModule,
    MatButtonModule,
    TopbarComponent,
    SidebarComponent
  ]
})
export class CardRoomPageComponent {
  cardsPerPage = 12;
  currentPage = 0;
  searchTerm = '';

  cards = Array.from({ length: 68 }).map((_, i) => ({
    title: `Discussion ${i + 1}`,
    peopleCount: 123,
    eventCount: 2
  }));

  filteredCards = [...this.cards];
  pagedCards: { title: string; peopleCount: number; eventCount: number; }[] = [];

  ngOnInit() {
    this.updatePagedCards();
  }

  onPageChange(event: any) {
    this.cardsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedCards();
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCards = this.cards.filter(card =>
      card.title.toLowerCase().includes(term)
    );
    this.currentPage = 0;
    this.updatePagedCards();
  }
  updatePagedCards() {
    const start = this.currentPage * this.cardsPerPage;
    const end = start + this.cardsPerPage;
    this.pagedCards = this.filteredCards.slice(start, end);
  }
}


import {Component, OnInit} from '@angular/core';
import {  MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {ChatRoom} from '../../../../Models/chat-room.model';
import {MatChip} from '@angular/material/chips';
import {ChatService} from '../../../../Services/chat.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateRoomComponent} from '../../../dialog/create-room/create-room.component';
import {MatTooltip} from '@angular/material/tooltip';
import {RealtimeChannel} from '@supabase/supabase-js';
import {supabase} from '../../../supabase.client';

@Component({
  selector: 'app-card-room-page',
  standalone: true,
  templateUrl: './card-room-page.component.html',
  styleUrls: ['./card-room-page.component.css'],
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
    MatChip,
    MatTooltip,
  ]
})

export class CardRoomPageComponent implements OnInit {
  rooms: ChatRoom[] = [];
  filteredRooms: ChatRoom[] = [];
  pagedRooms: ChatRoom[] = [];

  private roomChannel?: RealtimeChannel;

  searchTerm: string = '';
  selectedLabel: string | null = null;
  availableLabels: string[] = ['Karaoke', 'TED Talk', 'Chill', 'Vocabulary'];

  cardsPerPage = 8;
  currentPage = 0;

  constructor(private chatService: ChatService,
              private router: Router,
              private dialog: MatDialog) {}

  async ngOnInit() {
    this.rooms = await this.chatService.getAllRooms();
    this.filteredRooms = [...this.rooms];
    this.updatePagedRooms();
    await this.loadRooms();
    this.subscribeToRoomChanges();
  }
  ngOnDestroy() {
    if (this.roomChannel) {
      supabase.removeChannel(this.roomChannel);
    }
  }
  async loadRooms() {
    this.rooms = await this.chatService.getAllRooms();
    this.applyFilter();
  }
  subscribeToRoomChanges() {
    this.roomChannel = supabase
      .channel(`chat_rooms:client`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_rooms',
      }, (payload) => {
        console.log('📡 Room updated:', payload);
        const updated = payload.new as ChatRoom;
        const index = this.rooms.findIndex(r => r.id === updated.id);
        if (index !== -1) {
          this.rooms[index] = { ...this.rooms[index], ...updated };
        }
        this.applyFilter();
      })
      .subscribe();
  }
  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredRooms = this.rooms.filter(room =>
      room.name.toLowerCase().includes(term) &&
      (!this.selectedLabel || room.name.toLowerCase().includes(this.selectedLabel.toLowerCase()))
    );
    this.currentPage = 0;
    this.updatePagedRooms();
  }

  filterByLabel(label: string) {
    this.selectedLabel = label;
    this.applyFilter();
  }

  clearLabelFilter() {
    this.selectedLabel = null;
    this.applyFilter();
  }

  onPageChange(event: PageEvent) {
    this.cardsPerPage = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedRooms();
  }

  updatePagedRooms() {
    const start = this.currentPage * this.cardsPerPage;
    const end = start + this.cardsPerPage;
    this.pagedRooms = this.filteredRooms.slice(start, end);
  }
  goToChatRoom(room: ChatRoom): void {
    this.router.navigate(['/chat'], { state: { room } });
  }
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rooms.push(result);
        this.applyFilter(); // cập nhật lại danh sách hiển thị
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']); // hoặc '/' tùy route chính
  }
}

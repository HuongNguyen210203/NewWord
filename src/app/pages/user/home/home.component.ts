import { Component, OnInit } from '@angular/core';
import { CardEventComponent } from '../../../components/card-event/card-event.component';
import { CardRoomComponent } from '../../../components/card-room/card-room.component';
import {ChatRoom} from '../../../../Models/chat-room.model';
import {AppEvent} from '../../../../Models/event.model';
import {EventService} from '../../../../Services/event.service';
import {ChatService} from '../../../../Services/chat.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CardEventComponent,
    CardRoomComponent,
    MatButton,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  sidebarOpen = true;
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  rooms: ChatRoom[] = [];
  events: AppEvent[] = [];

  constructor(
    private chatService: ChatService,
    private eventService: EventService
  ) {}

  async ngOnInit() {
    this.rooms = await this.chatService.getAllRooms();
    this.events = await this.eventService.getAllEvents();
    console.log('[EVENTS]', this.events);

  }
}

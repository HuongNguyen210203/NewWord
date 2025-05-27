import { Component, OnInit } from '@angular/core';
import { CardEventComponent } from '../../components/card-event/card-event.component';
import { CardRoomComponent } from '../../components/card-room/card-room.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import {ChatRoom} from '../../../Models/chat-room.model';
import {AppEvent} from '../../../Models/event.model';
import {ChatRoomService} from '../../../Services/chat-room.service';
import {EventService} from '../../../Services/event.service';
import * as Console from 'node:console';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TopbarComponent,
    SidebarComponent,
    CardEventComponent,
    CardRoomComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  rooms: ChatRoom[] = [];
  events: AppEvent[] = [];

  constructor(
    private chatRoomService: ChatRoomService,
    private eventService: EventService
  ) {}

  async ngOnInit() {
    this.rooms = await this.chatRoomService.getAllRooms();
    this.events = await this.eventService.getAllEvents();
    console.log('[EVENTS]', this.events);

  }
}

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { CardEventComponent } from '../../../components/card-event/card-event.component';
import { CardRoomComponent } from '../../../components/card-room/card-room.component';
import {ChatRoom} from '../../../../Models/chat-room.model';
import {AppEvent} from '../../../../Models/event.model';
import {EventService} from '../../../../Services/event.service';
import {ChatService} from '../../../../Services/chat.service';
import {MatButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CardEventComponent,
    CardRoomComponent,
    MatButton,
    NgForOf,
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
    private eventService: EventService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.rooms = await this.chatService.getAllRooms();
    this.events = await this.eventService.getAllEvents();
    console.log('[EVENTS]', this.events);

  }

  @ViewChild('eventScroll') eventScroll!: ElementRef;
  @ViewChild('roomScroll') roomScroll!: ElementRef;

  scrollLeft(type: 'event' | 'room') {
    const container = type === 'event' ? this.eventScroll.nativeElement : this.roomScroll.nativeElement;
    container.scrollBy({ left: -240, behavior: 'smooth' }); // chỉnh step theo card width
  }

  scrollRight(type: 'event' | 'room') {
    const container = type === 'event' ? this.eventScroll.nativeElement : this.roomScroll.nativeElement;
    container.scrollBy({ left: 240, behavior: 'smooth' });
  }
  goToEventPage() {
    this.router.navigate(['/event-room-page']);
  }

  goToRoomPage() {
    this.router.navigate(['/card-room']);
  }
}

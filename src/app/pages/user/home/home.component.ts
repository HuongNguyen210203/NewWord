import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerToggle } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { CardEventComponent } from '../../../components/card-event/card-event.component';
import { CardRoomComponent } from '../../../components/card-room/card-room.component';
import { TimelineComponentComponent } from '../../../components/timeline-component/timeline-component.component';

import { ChatRoom } from '../../../../Models/chat-room.model';
import { AppEvent } from '../../../../Models/event.model';
import { ChatService } from '../../../../Services/chat.service';
import { EventService } from '../../../../Services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    CardEventComponent,
    CardRoomComponent,
    TimelineComponentComponent
  ],
})
export class HomeComponent implements OnInit {
  rooms: ChatRoom[] = [];
  events: AppEvent[] = [];

  randomRooms: ChatRoom[] = [];
  randomEvents: AppEvent[] = [];

  eventsOfSelectedDate: AppEvent[] = [];

  selectedDate: Date = new Date();
  timeMode: 'AM' | 'PM' = 'PM';

  @ViewChild('eventScroll') eventScroll!: ElementRef;
  @ViewChild('roomScroll') roomScroll!: ElementRef;

  constructor(
    private chatService: ChatService,
    private eventService: EventService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.rooms = await this.chatService.getAllRooms();
    if (this.rooms?.length > 0) {
      this.updateFilteredRooms(); // ✅ đảm bảo rooms đã sẵn sàng
    }

    this.events = await this.eventService.getAllEvents();
    if (this.events?.length > 0) {
      this.updateFilteredEvents();
    }
  }

  updateFilteredEvents() {
    this.randomEvents = this.getRandomItems(this.events, 10);
    this.eventsOfSelectedDate = this.randomEvents;
  }

  updateFilteredRooms() {
    if (!this.rooms || this.rooms.length === 0) return;
    this.randomRooms = this.getRandomItems(this.rooms, 10);
  }

  getRandomItems<T>(array: T[], count: number): T[] {
    const copied = [...array];
    for (let i = copied.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]];
    }
    return copied.slice(0, count);
  }


  scrollLeft(type: 'event' | 'room') {
    const container =
      type === 'event' ? this.eventScroll.nativeElement : this.roomScroll.nativeElement;
    container.scrollBy({ left: -240, behavior: 'smooth' });
  }

  scrollRight(type: 'event' | 'room') {
    const container =
      type === 'event' ? this.eventScroll.nativeElement : this.roomScroll.nativeElement;
    container.scrollBy({ left: 240, behavior: 'smooth' });
  }

  goToEventPage() {
    this.router.navigate(['/home/event-room-page']);
  }

  goToRoomPage() {
    this.router.navigate(['/home/card-room']);
  }
}

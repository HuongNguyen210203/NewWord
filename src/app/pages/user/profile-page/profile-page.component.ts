import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { User } from '../../../../Models/user.model';
import { ChangeAvatarDialogComponent } from './change-avatar-dialog/change-avatar-dialog.component';
import { supabase } from '../../../supabase.client';
import { UserService } from '../../../../Services/user.service';
import { EventService } from '../../../../Services/event.service';
import { ChatService } from '../../../../Services/chat.service';
import { AppEvent } from '../../../../Models/event.model';
import { ChatRoom } from '../../../../Models/chat-room.model';
import { Router } from '@angular/router';
import { JoinEventDialogComponent } from '../../../dialog/join-event-dialog/join-event-dialog.component';
import {TimelineComponentComponent} from '../../../components/timeline-component/timeline-component.component';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatButton,
    FormsModule,
    TimelineComponentComponent,
  ]
})
export class ProfilePageComponent implements OnInit {
  user!: User;
  eventSearch: string = '';
  roomSearch: string = '';
  events: AppEvent[] = [];
  rooms: ChatRoom[] = [];

  // ⏱ Timeline control
  selectedDate: Date = new Date();
  timeMode: 'AM' | 'PM' = 'AM';
  showAllEvents: boolean = false;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private eventService: EventService,
    private chatService: ChatService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData.user) {
      console.error('❌ Không tìm thấy người dùng đăng nhập:', error);
      return;
    }

    const uid = authData.user.id;
    const allUsers = await this.userService.getAllUsers();
    const currentUser = allUsers.find(u => u.id === uid);

    if (currentUser) {
      this.user = currentUser;

      // ✅ Lấy event đã tham gia (bao gồm cả bị ẩn)
      const { data: joinedEvents } = await supabase
        .from('event_participants')
        .select('event_id, events(*)')
        .eq('user_id', uid);

      this.events = (joinedEvents || []).map((item: any) => item.events);

      // ✅ Lấy room đã tham gia (bao gồm cả bị ẩn)
      const { data: joinedRooms } = await supabase
        .from('room_participants')
        .select('room_id, chat_rooms(*)')
        .eq('user_id', uid);

      this.rooms = (joinedRooms || []).map((item: any) => item.chat_rooms);
    } else {
      console.error('❌ Không tìm thấy thông tin người dùng trong bảng users');
    }

    // 🔄 Realtime cập nhật sự kiện
    supabase
      .channel('profile-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
      }, () => this.ngOnInit())
      .subscribe();

    // 🔄 Realtime cập nhật phòng
    supabase
      .channel('profile-rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms',
      }, () => this.ngOnInit())
      .subscribe();
  }

  // 🎯 Tìm kiếm + lọc theo ngày (nếu chưa bật showAll)
  filteredEvents() {
    const keyword = this.eventSearch.toLowerCase();

    return this.events.filter(e => {
      const matchesTitle = e.title.toLowerCase().includes(keyword);
      if (this.showAllEvents) return matchesTitle;

      const eventDate = new Date(e.start_time);
      const isSameDay = eventDate.toDateString() === this.selectedDate.toDateString();
      return matchesTitle && isSameDay;
    });
  }

  filteredRooms() {
    return this.rooms.filter(r =>
      r.name.toLowerCase().includes(this.roomSearch.toLowerCase())
    );
  }

  toggleShowAllEvents() {
    this.showAllEvents = !this.showAllEvents;
  }

  openEditProfileDialog() {
    const dialogRef = this.dialog.open(ChangeAvatarDialogComponent, {
      width: '500px',
      data: {
        user: { ...this.user },
      },
    });

    dialogRef.afterClosed().subscribe(async (updatedUser: User | undefined) => {
      if (updatedUser) {
        this.user = updatedUser;
        try {
          await this.userService.updateUser(updatedUser);
          this.userService.setAvatarUrl(updatedUser.avatar_url || 'https://via.placeholder.com/40');
          console.log('✅ Thông tin người dùng đã được cập nhật.');
        } catch (error) {
          console.error('❌ Không thể cập nhật người dùng:', error);
        }
      }
    });
  }

  scrollLeft(container: HTMLElement) {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(container: HTMLElement) {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  goToEventPage() {
    this.router.navigate(['/home/event-room-page']);
  }

  goToRoomPage() {
    this.router.navigate(['/home/card-room']);
  }

  goToChatRoom(room: ChatRoom) {
    this.router.navigate(['/chat'], { state: { room } });
  }

  openEventDialog(event: AppEvent) {
    const dialogRef = this.dialog.open(JoinEventDialogComponent, {
      data: event,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.cancelledEventId) {
        this.events = this.events.filter(e => e.id !== result.cancelledEventId);
      }
    });
  }
}

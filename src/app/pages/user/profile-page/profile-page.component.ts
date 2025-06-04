import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {CommonModule, NgForOf} from '@angular/common';

import { User } from '../../../../Models/user.model';
import { ChangeAvatarDialogComponent } from './change-avatar-dialog/change-avatar-dialog.component';
import {supabase} from '../../../supabase.client';
import {UserService} from '../../../../Services/user.service';
import {FormsModule} from '@angular/forms';
import {EventService} from '../../../../Services/event.service';
import {ChatService} from '../../../../Services/chat.service';
import {AppEvent} from '../../../../Models/event.model';
import {ChatRoom} from '../../../../Models/chat-room.model';
import {Router} from '@angular/router';

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
  ]
})
export class ProfilePageComponent implements OnInit {
  user!: User;
  eventSearch: string = '';
  roomSearch: string = '';
  events: AppEvent[] = [];
  rooms: ChatRoom[] = [];

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

      // ✅ Lấy các event mà user đã tham gia
      const { data: joinedEvents, error: eventErr } = await supabase
        .from('event_participants')
        .select('event_id, events(*)')
        .eq('user_id', uid);

      this.events = (joinedEvents || []).map((item: any) => item.events);

      // ✅ Lấy các room mà user đã tham gia
      const { data: joinedRooms, error: roomErr } = await supabase
        .from('room_participants')
        .select('room_id, chat_rooms(*)')
        .eq('user_id', uid);

      this.rooms = (joinedRooms || []).map((item: any) => item.chat_rooms);
    } else {
      console.error('❌ Không tìm thấy thông tin người dùng trong bảng users');
    }
  }

  filteredEvents() {
    return this.events.filter(e =>
      e.title.toLowerCase().includes(this.eventSearch.toLowerCase())
    );
  }

  filteredRooms() {
    return this.rooms.filter(r =>
      r.name.toLowerCase().includes(this.roomSearch.toLowerCase())
    );
  }

  openEditProfileDialog() {
    const dialogRef = this.dialog.open(ChangeAvatarDialogComponent, {
      width: '500px',
      data: {
        user: { ...this.user }, // clone để tránh sửa trực tiếp
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

}

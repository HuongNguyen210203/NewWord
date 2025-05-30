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

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatButton,
    NgForOf,
    FormsModule,
  ]
})
export class ProfilePageComponent implements OnInit {
  user!: User;

  eventSearch: string = '';
  roomSearch: string = '';

  events = [
    {
      id: 'e1',
      title: 'Bay cho',
      image: 'https://i.ibb.co/0Kkz9C6/event1.jpg',
    },
    {
      id: 'e2',
      title: 'Miku',
      image: 'https://i.ibb.co/WDWS2yH/event2.jpg',
    },
    {
      id: 'e3',
      title: 'Ohana is family',
      image: 'https://i.ibb.co/0htQv7G/event3.jpg',
    },
  ];

  rooms = [
    {
      id: 'r1',
      name: 'English class',
      image: 'https://i.ibb.co/Y8bnVkn/room1.jpg',
    },
    {
      id: 'r2',
      name: 'Meo Room',
      image: 'https://i.ibb.co/ZLzLS7c/room2.jpg',
    },
    {
      id: 'r3',
      name: 'Chim Loi',
      image: 'https://i.ibb.co/VxTL6f1/room3.jpg',
    },
  ];

  constructor(
    private dialog: MatDialog,
    private userService: UserService
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
}

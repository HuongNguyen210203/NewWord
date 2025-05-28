import { Component, OnInit } from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {User} from '../../../../Models/user.model';
import {MaterialModule} from '../../../modules/material/material.module';
import {ChangeAvatarDialogComponent} from './change-avatar-dialog/change-avatar-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  imports: [
    MatIcon,
    MatButton,
    MatFormField,
    MatInput,
    MatSuffix,
    MatFormField,
    MaterialModule,
    NgForOf
  ]
})
export class ProfilePageComponent implements OnInit {
  user: User = {
    id: '1',
    name: 'Diego',
    email: 'kiet@gmail.com',
    avatar_url: '',
    role: 'user',
    is_hidden: false,
    joinedRooms: 3,
    events: 4,
  };

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



  ngOnInit(): void {
    // Load user and data here if needed (e.g. from Supabase)
  }

  filteredEvents() {
    return this.events.filter(e =>
      e.title.toLowerCase().includes(this.eventSearch?.toLowerCase() || '')
    );
  }

  filteredRooms() {
    return this.rooms.filter(r =>
      r.name.toLowerCase().includes(this.roomSearch?.toLowerCase() || '')
    );
  }


  constructor(private dialog: MatDialog) {}

  openEditProfileDialog() {
    this.dialog.open(ChangeAvatarDialogComponent, {
      width: '500px',
      data: {
        user: this.user,
      },
    });
  }
}

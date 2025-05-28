import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {User} from '../../../../Models/user.model';
import {UserService} from '../../../../Services/user.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  user: User = {
    id: '',
    name: '',
    email: '',
    avatar_url: '',
    role: '',
    is_hidden: false,
    joinedRooms: 0,
    events: 0
  };

  events: { title: string }[] = [];

  constructor(private userService: UserService) {}

  async ngOnInit() {
    const users = await this.userService.getAllUsers();
    if (users.length > 0) {
      this.user = users[0];
    }
    this.loadEvents();
  }

  async loadEvents() {
    // Tạm thời giả lập sự kiện nếu không có API cụ thể
    this.events = [
      { title: 'Event A' },
      { title: 'Event B' },
      { title: 'Event C' }
    ];
  }
}

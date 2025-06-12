import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { supabase } from '../../supabase.client';
import { Router } from '@angular/router';
import { UserService } from '../../../Services/user.service';
import { NotificationService } from '../../../Services/notification.service';
import { Notification } from '../../../Models/notification.model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbar, MatIconButton, MatIcon, CommonModule,],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  avatarUrl: string = 'https://via.placeholder.com/40';
  notifications: Notification[] = [];
  hasUnread: boolean = false;
  showNotifications: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    this.userService.avatarUrl$.subscribe(url => {
      this.avatarUrl = url;
    });

    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData.user) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (!userError && userData?.avatar_url) {
      this.userService.setAvatarUrl(userData.avatar_url);
    }

    this.notificationService.notifications$.subscribe(n => this.notifications = n);
    this.notificationService.hasUnread$.subscribe(flag => this.hasUnread = flag);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.markAllAsRead();
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  onMenuClick() {
    this.menuClick.emit();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    await this.notificationService.fetchNotifications();
  }
}

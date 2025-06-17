import { Component, EventEmitter, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

import { supabase } from '../../supabase.client';
import { Notification } from '../../../Models/notification.model';
import { UserService } from '../../../Services/user.service';
import { NotificationService } from '../../../Services/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
  imports: [MatToolbar, MatIconButton, MatIcon, CommonModule],
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
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // ✅ Sync avatar
    this.userService.avatarUrl$.subscribe(url => {
      this.avatarUrl = url;
    });

    // ✅ Ensure Supabase is authenticated before querying user avatar
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData.user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userData?.avatar_url) {
      this.userService.setAvatarUrl(userData.avatar_url);
    }

    // ✅ Notification list observable
    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
      this.cdr.detectChanges(); // ensure view updates
    });

    // ✅ Unread badge
    this.notificationService.hasUnread$.subscribe(flag => {
      this.hasUnread = flag;
      this.cdr.detectChanges();
    });

    // ✅ Fix: Delay realtime subscribe to ensure userId is ready
    setTimeout(() => {
      this.notificationService.reconnectRealtime(); // <== nếu dùng custom reconnect logic
    }, 500); // delay to ensure Supabase user is ready
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

  async deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    await this.notificationService.fetchNotifications();
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
}

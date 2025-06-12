import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';
import {NotificationService} from '../../../../../../Services/notification.service';
import {Notification} from '../../../../../../Models/notification.model';
import {CommonModule} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';
import {supabase} from '../../../../../supabase.client';

@Component({
  selector: 'app-topbar',
  imports: [
    MatIconButton,
    MatIcon,
    CommonModule,
    MatToolbar,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  notifications: Notification[] = [];
  hasUnread: boolean = false;
  showNotifications: boolean = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
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

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  async deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    await this.notificationService.fetchNotifications();
  }

}


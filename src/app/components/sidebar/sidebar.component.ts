import { Component, Input} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {AuthService} from '../../../Services/auth.service';

interface MenuItem {
  icon: string
  label: string
  route: string
}
@Component({
  selector: 'app-sidebar',
  imports: [
    MatIcon,
    MatIcon,
    RouterLink,
    NgForOf,
    MatIcon,
    NgIf,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() open = true;
  activeItem = '';

  constructor(
    private router: Router,
    private authService: AuthService) {}

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'chat', label: 'Chat', route: '/chat' },
    { icon: 'people', label: 'Profile', route: '/profile' },
  ];

  setActive(item: string) {
    this.activeItem = item;
  }

  async handleLogout() {
    console.log('Logging out...');
    try {
      await this.authService.signOut(); // Gọi phương thức đăng xuất từ service
      this.router.navigate(['/signin']); // Chuyển về trang đăng nhập
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      alert('Đã xảy ra lỗi khi đăng xuất');
    }
  }
}

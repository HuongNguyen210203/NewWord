import { Component, Input} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

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

  constructor(private router: Router) {}

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
    { icon: 'event', label: 'Manage Event', route: '/management-event' },
    { icon: 'people', label: 'Manage Profile', route: '/management-profile' },
    { icon: 'forum', label: 'Manage Room', route: '/management-room' },
  ];

  setActive(item: string) {
    this.activeItem = item;
  }

  handleLogout() {
    console.log('Logging out...');
    // TODO: Gọi AuthService.logout() hoặc điều hướng về /login
  }
}

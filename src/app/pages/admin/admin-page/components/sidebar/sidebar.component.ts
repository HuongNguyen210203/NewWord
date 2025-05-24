import { Component, Input} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {AuthService} from '../../../../../../Services/auth.service';

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
    MatIcon,
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
    { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
    { icon: 'event', label: 'Manage Event', route: '/management-event' },
    { icon: 'people', label: 'Manage Profile', route: '/management-profile' },
    { icon: 'forum', label: 'Manage Room', route: '/management-room' },
  ];

  setActive(item: string) {
    this.activeItem = item;
  }

  handleLogout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/signin']);
    });
  }

}

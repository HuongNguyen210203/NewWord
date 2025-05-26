import {Component, Input, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
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
export class SidebarComponent implements OnInit {
  @Input() open = true;
  activeItem = '';

  constructor(private router: Router, private authService: AuthService) {}

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
    { icon: 'event', label: 'Manage Event', route: '/management-event' },
    { icon: 'people', label: 'Manage Profile', route: '/management-profile' },
    { icon: 'forum', label: 'Manage Room', route: '/management-room' }
  ];

  ngOnInit() {
    this.activeItem = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.urlAfterRedirects;
      }
    });
  }

  setActive(itemRoute: string) {
    this.activeItem = itemRoute;
  }

  handleLogout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/signin']);
    });
  }
}

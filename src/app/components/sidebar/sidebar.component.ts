import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {Router, NavigationEnd, RouterLinkActive, RouterLink} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../Services/auth.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIcon,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() open: boolean = true;
  activeItem: string = '';
  routerSubscription!: Subscription;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'chat', label: 'Chat', route: '/chat' },
    { icon: 'people', label: 'Profile', route: '/profile' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.urlAfterRedirects;
      }
    });
    this.activeItem = this.router.url;
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  setActive(route: string) {
    this.activeItem = route;
  }

  async handleLogout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/signin']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

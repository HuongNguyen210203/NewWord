import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../Services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() open: boolean = true;
  activeItem: string = '';
  routerSubscription!: Subscription;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
    { icon: 'event', label: 'Manage Event', route: '/management-event' },
    { icon: 'people', label: 'Manage Profile', route: '/management-profile' },
    { icon: 'forum', label: 'Manage Room', route: '/management-room' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activeItem = this.router.url;
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.urlAfterRedirects;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  setActive(route: string): void {
    this.activeItem = route;
  }

  handleLogout(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/signin']);
    });
  }
}

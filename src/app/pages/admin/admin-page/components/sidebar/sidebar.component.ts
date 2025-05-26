import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

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

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin' },
    { label: 'Manage Event', icon: 'event', route: '/management-event' },
    { label: 'Manage Profile', icon: 'group', route: '/management-profile' },
    { label: 'Manage Room', icon: 'chat', route: '/management-room' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Cập nhật activeItem mỗi khi route thay đổi
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
}

import { Component, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
  imports: [
    NgClass,
    SidebarComponent,
    TopbarComponent,
    RouterOutlet
  ]
})
export class AdminPageComponent {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }
}

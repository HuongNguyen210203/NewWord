import { Component, OnInit } from '@angular/core';
import {SidebarComponent} from '../../../components/sidebar/sidebar.component';
import {RouterOutlet} from '@angular/router';
import {TopbarComponent} from '../../../components/topbar/topbar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    SidebarComponent,
    RouterOutlet,
    TopbarComponent
  ],
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent implements OnInit {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    localStorage.setItem('sidebarOpen', this.sidebarOpen.toString());
  }

  ngOnInit(): void {
    const cached = localStorage.getItem('sidebarOpen');
    if (cached) this.sidebarOpen = cached === 'true';
  }
}

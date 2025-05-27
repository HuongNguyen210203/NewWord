import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {NgClass, NgFor} from '@angular/common';
import {SidebarComponent} from '../../components/sidebar/sidebar.component'; // để dùng *ngFor
import {TopbarComponent} from '../../components/topbar/topbar.component'; // để dùng *ngFor
@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',


  styleUrls: ['./profile-page.component.css'],


  imports: [
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    NgFor,
    TopbarComponent,
    SidebarComponent,
    NgClass
  ]
})
export class ProfilePageComponent {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

}

import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';
// import {TopbarComponent} from '../../../../../../../DoAnA/NewWord/src/app/components/topbar/topbar.component';
import {CardEventComponent} from '../../components/card-event/card-event.component';
import {CardRoomComponent} from '../../components/card-room/card-room.component';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
// import {SidebarComponent} from '../../../../../../../DoAnA/NewWord/src/app/components/sidebar/sidebar.component'; // để dùng *ngFor
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
    CardEventComponent,
    CardRoomComponent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    SidebarComponent
  ]
})
export class ProfilePageComponent {}

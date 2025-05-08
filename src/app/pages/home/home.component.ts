import { Component } from '@angular/core';
import {MaterialModule} from '../../modules/material/material.module';
import {CardEventComponent} from '../../components/card-event/card-event.component';
import {CardRoomComponent} from '../../components/card-room/card-room.component';
import {TopbarComponent} from '../../../../../../../DoAnA/NewWord/src/app/components/topbar/topbar.component';
import {SidebarComponent} from '../../../../../../../DoAnA/NewWord/src/app/components/sidebar/sidebar.component';
import {NgForOf} from '@angular/common';


@Component({
  selector: 'app-home',
  imports: [
    MaterialModule,
    CardRoomComponent,
    TopbarComponent,
    SidebarComponent,
    CardEventComponent,
    NgForOf,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  rooms = new Array(15).fill({});
  events = [
    { label: '1st' },
    { label: '2nd' },
    { label: '3rd' },
    { label: '4th' },
    { label: '5th' },
    { label: '6th' },
    { label: '7th' },
    { label: '8th' },
    { label: '9th' },
    { label: '10th' },
    { label: '11th' },
    { label: '12th' },
    { label: '13th' },
    { label: '14th' },
    { label: '15th' },
  ];
}

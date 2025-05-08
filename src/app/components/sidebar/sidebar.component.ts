import { Component } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';

import {RouterLink, RouterLinkActive} from '@angular/router';


@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    MaterialModule,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}

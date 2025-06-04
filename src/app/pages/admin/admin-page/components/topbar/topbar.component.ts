import { Component, EventEmitter, Output} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  constructor(private router: Router) {}
  @Output() menuClick = new EventEmitter<void>()

  onMenuClick() {
    this.menuClick.emit()
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

}


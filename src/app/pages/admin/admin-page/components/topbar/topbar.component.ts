import { Component, EventEmitter, Output} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {NgOptimizedImage} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-topbar',
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    NgOptimizedImage
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  @Output() menuClick = new EventEmitter<void>()

  onMenuClick() {
    this.menuClick.emit()
  }
}


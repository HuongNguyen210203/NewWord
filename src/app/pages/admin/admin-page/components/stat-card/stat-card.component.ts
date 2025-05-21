import { Component, Input } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';

@Component({
  selector: 'app-stat-card',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatCardHeader
  ],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title = ""
  @Input() value = ""
  @Input() subtitle = ""
  @Input() color = "blue"
  @Input() secondValue = ""
  @Input() secondSubtitle = ""

  get colorClass(): string {
    return `color-${this.color}`
  }
}

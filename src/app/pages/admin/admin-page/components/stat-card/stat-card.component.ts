import { Component, Input } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-stat-card',
  standalone: true,
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
  @Input() title: string = "";
  @Input() value: number | string = "";
  @Input() subtitle: string = "";
  @Input() color: 'blue' | 'orange' | 'purple' | 'red' = 'blue';

  @Input() secondValue?: number | string;
  @Input() secondSubtitle?: string;

  get colorClass(): string {
    return `color-${this.color}`;
  }
}

import { Component, Input } from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MaterialModule} from '../../modules/material/material.module';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-card-event',
  standalone: true,
  templateUrl: './card-event.component.html',
  imports: [
    MatCardContent,
    MatCard,
    MaterialModule,
    NgStyle
  ],
  styleUrls: ['./card-event.component.scss']
})
export class CardEventComponent {
  @Input() label: string = '';
  @Input() imageUrl: string = '';

  get safeImageUrl(): string {
    return this.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
  }
}

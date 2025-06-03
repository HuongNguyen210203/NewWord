import { Component, Input } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MaterialModule } from '../../modules/material/material.module';
import { JoinEventDialogComponent } from '../../dialog/join-event-dialog/join-event-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AppEvent } from '../../../Models/event.model';

@Component({
  selector: 'app-card-event',
  standalone: true,
  templateUrl: './card-event.component.html',
  imports: [
    MatCardContent,
    MatCard,
    MaterialModule,
  ],
  styleUrls: ['./card-event.component.scss']
})
export class CardEventComponent {
  @Input() event!: AppEvent;

  constructor(private dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(JoinEventDialogComponent, {
      width: '500px',
      data: {
        id: this.event.id,
        title: this.event.title,
        description: this.event.description,
        image_url: this.event.image_url,
        start_time: this.event.start_time,
        max_participants: this.event.max_participants,
      }
    });
  }

  get safeImageUrl(): string {
    return this.event.image_url || 'https://via.placeholder.com/300x200?text=No+Image';
  }

  getMonthLabel(): string {
    const date = new Date(this.event.start_time);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  }

  getDayLabel(): string {
    const date = new Date(this.event.start_time);
    return isNaN(date.getTime()) ? '' : String(date.getDate()).padStart(2, '0');
  }
}

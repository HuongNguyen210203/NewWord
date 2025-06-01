import { Component, Input } from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MaterialModule} from '../../modules/material/material.module';
import {JoinEventDialogComponent} from '../../dialog/join-event-dialog/join-event-dialog.component';
import {MatDialog} from '@angular/material/dialog';



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
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() date: string | Date = '';
  @Input() imageUrl: string = '';

  constructor(private dialog: MatDialog) {}
  openDialog() {
    this.dialog.open(JoinEventDialogComponent, {
      data: {
        title: this.title,
        description: this.description,
        date: this.date,
        imageUrl: this.safeImageUrl,
      },
      width: '500px'
    });
  }


  get safeImageUrl(): string {
    return this.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
  }

  getMonthLabel(): string {
    const date = new Date(this.date);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  }

  getDayLabel(): string {
    const date = new Date(this.date);
    return isNaN(date.getTime()) ? '' : String(date.getDate()).padStart(2, '0');
  }


}

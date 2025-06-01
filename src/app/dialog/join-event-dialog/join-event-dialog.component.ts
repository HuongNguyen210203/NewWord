import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-join-event-dialog',
  imports: [
    MatDialogContent,
    DatePipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './join-event-dialog.component.html',
  styleUrl: './join-event-dialog.component.css'
})
export class JoinEventDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { JoinEventDialogComponent } from '../../dialog/join-event-dialog/join-event-dialog.component';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-timeline-component',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './timeline-component.component.html',
  styleUrls: ['./timeline-component.component.css'],
})
export class TimelineComponentComponent implements OnChanges {
  @Input() events: any[] = [];
  @Input() selectedDate: Date = new Date();
  @Input() timeMode: 'AM' | 'PM' = 'PM';

  popupEvents: any[] = [];
  hourMarkers: number[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.updateHourMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeMode']) {
      this.updateHourMarkers();
    }
  }

  updateHourMarkers() {
    if (this.timeMode === 'PM') {
      this.hourMarkers = [12, 14, 16, 18, 20, 22, 24];
    } else {
      this.hourMarkers = [0, 2, 4, 6, 8, 10, 12];
    }
  }

  get filteredEvents() {
    return this.events.filter(e => {
      const d = new Date(e.start_time);
      const h = d.getHours();
      return (
        d.toDateString() === this.selectedDate.toDateString() &&
        ((this.timeMode === 'AM' && h < 12) || (this.timeMode === 'PM' && h >= 12))
      );
    });
  }

  getMarkerPosition(startTime: string): string {
    const date = new Date(startTime);
    const hour = date.getHours() + date.getMinutes() / 60;
    const range = this.timeMode === 'PM' ? [12, 24] : [0, 12];
    let percentage = ((hour - range[0]) / (range[1] - range[0])) * 100;
    return `${Math.max(0, Math.min(100, percentage))}%`;
  }

  getMarkerPercent(hour: number): string {
    const rangeStart = this.timeMode === 'PM' ? 12 : 0;
    const percentage = ((hour - rangeStart) / 12) * 100;
    return `${percentage}%`;
  }

  formatHourLabel(hour: number): string {
    if (hour === 0) return '12 A.M';
    if (hour === 12) return '12 P.M';
    if (hour === 24) return '12 A.M';
    if (this.timeMode === 'AM') return `${hour} A.M`;
    return `${hour - 12} P.M`;
  }

  onMarkerClick(startTime: string) {
    const hour = new Date(startTime).getHours();
    this.popupEvents = this.filteredEvents.filter(
      e => new Date(e.start_time).getHours() === hour
    );
  }

  openDialog(event: any) {
    this.dialog.open(JoinEventDialogComponent, {
      data: event,
      width: '500px',
    });
  }

  getStartLabel(): string {
    return this.timeMode === 'AM' ? '12 A.M' : '12 P.M';
  }

  getEndLabel(): string {
    return this.timeMode === 'AM' ? '12 P.M' : '12 A.M';
  }

  toggleTimeMode() {
    this.timeMode = this.timeMode === 'AM' ? 'PM' : 'AM';
    this.updateHourMarkers();
    this.popupEvents = [];
  }

  onDateChange() {
    this.popupEvents = [];
  }
}

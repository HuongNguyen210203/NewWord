import {Component, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {EventService} from '../../../../../../Services/event.service';

export interface Event {
  name: string
  attendees: string
  time: string
}
@Component({
  selector: 'app-events-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatRowDef,
    MatHeaderRowDef,
    MatRow,
    MatHeaderRow,
    MatIcon,
  ],
  templateUrl: './events-table.component.html',
  styleUrl: './events-table.component.css'
})
export class EventsTableComponent implements OnInit {
  events: any[] = [];
  displayedColumns: string[] = ['name', 'attendees', 'time'];

  constructor(private eventService: EventService) {}

  async ngOnInit() {
    const topEvents = await this.eventService.getTopEventsByParticipants();
    this.events = topEvents.map(event => ({
      name: event.title,
      attendees: event.current_participants,
      time: new Date(event.start_time).toLocaleString()
    }));
  }
}

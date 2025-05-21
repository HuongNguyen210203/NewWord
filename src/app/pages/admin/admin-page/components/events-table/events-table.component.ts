import { Component } from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';

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
    MatHeaderRow
  ],
  templateUrl: './events-table.component.html',
  styleUrl: './events-table.component.css'
})
export class EventsTableComponent {
  displayedColumns: string[] = ["name", "attendees", "time"]

  events: Event[] = [
    { name: "Native Speaking", attendees: "26,000", time: "8:00" },
    { name: "ThanksGiving", attendees: "22,000", time: "9:00" },
    { name: "Tet Holiday", attendees: "22,000", time: "10:00" },
  ]
}


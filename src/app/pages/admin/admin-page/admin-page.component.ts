import { Component, OnInit } from '@angular/core';
import { SingleSeries } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss']
})
export class AdminManagementComponent implements OnInit {
  // Chart data configuration with explicit type for ngx-charts
  chartData: SingleSeries = [
    { name: 'q1', value: -20 },
    { name: 'q2', value: 50 },
    { name: 'q3', value: -40 },
    { name: 'q4', value: 30 }
  ];

  // Color scheme with explicit type
  colorScheme: { domain: string[] } = {
    domain: ['#5AA454'] // Green color to match the chart
  };

  // Event table data with explicit interface
  eventRows: Array<{ name: string; attendees: number; time: string }> = [
    { name: 'Native Speaking', attendees: 26000, time: '8:00' },
    { name: 'Thanksgiving', attendees: 22000, time: '9:00' },
    { name: 'Tet Holiday', attendees: 22000, time: '10:00' }
  ];

  // Discussion table data with explicit interface
  discussionRows: Array<{ name: string; attendees: number; time: string }> = [
    { name: 'Native Speaking', attendees: 26000, time: '8:00' },
    { name: 'Thanksgiving', attendees: 22000, time: '9:00' },
    { name: 'Tet Holiday', attendees: 22000, time: '10:00' }
  ];

  constructor() {}

  ngOnInit(): void {}
}

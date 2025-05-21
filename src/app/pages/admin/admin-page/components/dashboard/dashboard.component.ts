import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {EventsTableComponent} from '../events-table/events-table.component';
import {BarChartComponent} from '../bar-chart/bar-chart.component';
import {MatFormField, MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {StatCardComponent} from '../stat-card/stat-card.component';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardTitle,
    MatCardContent,
    EventsTableComponent,
    MatCardHeader,
    MatCard,
    BarChartComponent,
    MatFormField,
    MatSelect,
    MatOption,
    NgForOf,
    StatCardComponent,
    MatIcon,
    MatInput
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  timeFrames = ["This Week", "Last Week", "This Month"]
  selectedTimeFrame = "This Week"
}


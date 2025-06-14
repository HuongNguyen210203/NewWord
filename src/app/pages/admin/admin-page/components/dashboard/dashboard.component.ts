import { Component, OnInit } from '@angular/core';
import { supabase } from '../../../../../supabase.client';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

// Component con (standalone)
import { StatCardComponent } from '../stat-card/stat-card.component';
import { EventsTableComponent } from '../events-table/events-table.component';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    StatCardComponent,
    EventsTableComponent,
    BarChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // Stat card values
  totalEvents = 0;
  totalRooms = 0;
  totalUsers = 0;
  newMessages = 0;
  pastMessages = 0;
  totalOrders = 50;

  // Chart
  userChartLabels: string[] = [];
  userChartData: number[] = [];

  // Dropdown
  timeFrames = ['This Week', 'Last Week', 'This Month'];
  selectedTimeFrame = 'This Week';

  async ngOnInit() {
    await this.loadStats();
    await this.loadUserStats();
    this.generateUserChartData();
  }

  async loadStats() {
    const { data: events } = await supabase.from('events').select('id');
    this.totalEvents = events?.length || 0;

    const { data: rooms } = await supabase.from('chat_rooms').select('id');
    this.totalRooms = rooms?.length || 0;

    const { data: messages } = await supabase.from('messages').select('*');
    this.newMessages = messages?.filter(m => !m.is_read)?.length || 0;
    this.pastMessages = messages?.filter(m => m.is_flagged)?.length || 0;
  }

  async loadUserStats() {
    const { data: users } = await supabase.from('users').select('id');
    if (!users) return;

    this.totalUsers = users.length;

    // Dữ liệu biểu đồ giả lập (gắn user.length label)
    this.userChartLabels = users.map((_, i) => `${i + 1}`);
    this.userChartData = users.map(() => Math.floor(Math.random() * 60));
  }

  // Khi user chọn mốc thời gian mới
  async onTimeFrameChange() {
    await this.loadUserStats(); // vẫn dùng full list
  }

  generateUserChartData() {
    this.userChartLabels = Array.from({ length: 20 }, (_, i) => `${i + 1}`);
    this.userChartData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 60));
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#f0f0f0',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  ngOnInit(): void {
    this.generateChartData();
  }

  private generateChartData(): void {
    const labels = Array.from({ length: 20 }, (_, i) => `${i + 1}`);
    const data = Array.from({ length: 20 }, () => Math.floor(Math.random() * 60));

    this.barChartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Users',
          backgroundColor: '#4CAF82',
          borderColor: '#4CAF82',
          borderWidth: 1,
        },
      ],
    };
  }
}

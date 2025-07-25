// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ChartData, ChartOptions, ChartType } from 'chart.js';
// import { NgChartsModule } from 'ng2-charts';
// import { ChangeDetectionStrategy } from '@angular/core';
//
// @Component({
//   selector: 'app-bar-chart',
//   standalone: true,
//   imports: [CommonModule, NgChartsModule],
//   templateUrl: './bar-chart.component.html',
//   styleUrls: ['./bar-chart.component.css'],
// })
// export class BarChartComponent {
//   @Input() chartData: number[] = [];
//   @Input() chartLabels: string[] = [];
//   @Input() chartTitle: string = 'Chart';
//
//   public barChartType: ChartType = 'bar';
//   public barChartOptions: ChartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: false,
//       },
//       title: {
//         display: true,
//         text: this.chartTitle,
//       },
//     },
//     scales: {
//       x: {
//         title: {
//           display: true,
//           text: 'Date',
//         },
//         grid: {
//           display: false,
//         }
//       },
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Events',
//         },
//         grid: {
//           display: false,
//         }
//       },
//     },
//   };
//
//   get barChartData(): ChartData<'bar'> {
//     return {
//       labels: this.chartLabels,
//       datasets: [
//         {
//           data: this.chartData,
//           label: 'Events',
//           backgroundColor: '#4CAF50',
//         },
//       ],
//     };
//   }
// }

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements OnChanges {
  @Input() chartData: number[] = [];
  @Input() chartLabels: string[] = [];
  @Input() chartTitle: string = 'Chart';

  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: this.chartTitle,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Events',
        },
        grid: {
          display: false,
        }
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartTitle']) {
      this.barChartOptions.plugins!.title!.text = this.chartTitle;
    }
  }

  get barChartData(): ChartData<'bar'> {
    return {
      labels: this.chartLabels,
      datasets: [
        {
          data: this.chartData,
          label: 'Events',
          backgroundColor: '#4CAF50',
        },
      ],
    };
  }
}


// import { Component } from '@angular/core';
// import { SelectionModel } from '@angular/cdk/collections';
// import { MatTableDataSource } from '@angular/material/table';
//
// @Component({
//   selector: 'app-event-management',
//   templateUrl: './event-management.component.html',
// })
// export class EventManagementComponent {
//   displayedColumns: string[] = ['select', 'image', 'name', 'description', 'registerStart', 'registerEnd', 'eventDate', 'participants'];
//   dataSource = new MatTableDataSource<any>([{
//     image: 'https://via.placeholder.com/100x60',
//     name: 'Lorem Ipsum Dolor Sit',
//     description: 'Lorem Ipsum Dolor Sit Amet',
//     registerStart: new Date(),
//     registerEnd: new Date(),
//     eventDate: new Date(),
//     // participants: 100
//   }]);
//   selection = new SelectionModel<any>(true, []);
//
//   isAllSelected() {
//     const numSelected = this.selection.selected.length;
//     const numRows = this.dataSource.data.length;
//     return numSelected === numRows;
//   }
//
//   masterToggle() {
//     this.isAllSelected()
//       ? this.selection.clear()
//       : this.dataSource.data.forEach(row => this.selection.select(row));
//   }
// }

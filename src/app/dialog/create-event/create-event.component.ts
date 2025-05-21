import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-create-event',
  standalone: true,
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
  imports: [
    FormsModule,
    NgIf,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
// export class CreateEventComponent {
//   eventImage: string | ArrayBuffer | null = null;
//
//   event = {
//     title: '',
//     description: '',
//     startDate: '',
//     startTime: '09:00',
//     endDate: '',
//     endTime: '17:00',
//     registerDeadline: '',
//     maxAttendees: 0,
//     location: '',
//   };
//
//   onImageChange(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => (this.eventImage = reader.result);
//       reader.readAsDataURL(file);
//     }
//   }
//
//   createEvent() {
//     const start = this.combineDateAndTime(this.event.startDate, this.event.startTime);
//     const end = this.combineDateAndTime(this.event.endDate, this.event.endTime);
//
//     if (!start || !end) {
//       alert('Vui lòng điền đầy đủ ngày và giờ bắt đầu/kết thúc.');
//       return;
//     }
//
//     if (end <= start) {
//       alert('Giờ kết thúc phải sau giờ bắt đầu.');
//       return;
//     }
//
//     console.log('Sự kiện đã tạo:', {
//       ...this.event,
//       start,
//       end
//     });
//
//     alert('Sự kiện đã được tạo thành công!');
//   }
//
//   combineDateAndTime(date: any, time: string): Date | null {
//     if (!date || !time) return null;
//     const [hours, minutes] = time.split(':').map(Number);
//     const result = new Date(date);
//     result.setHours(hours, minutes, 0, 0);
//     return result;
//   }
// }
export class CreateEventComponent {
  eventImage: string | ArrayBuffer | null = null;

  event = {
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    registerDeadline: '',
    maxAttendees: 0,
    location: '',
  };

  constructor(protected dialogRef: MatDialogRef<CreateEventComponent>) {}

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.eventImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  createEvent() {
    const start = this.combineDateAndTime(this.event.startDate, this.event.startTime);
    const end = this.combineDateAndTime(this.event.endDate, this.event.endTime);

    if (!start || !end || end <= start) {
      alert('Vui lòng nhập ngày giờ hợp lệ.');
      return;
    }

    this.dialogRef.close({
      ...this.event,
      start,
      end,
      image: this.eventImage
    });
  }

  combineDateAndTime(date: any, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}

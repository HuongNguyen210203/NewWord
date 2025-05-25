import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import {supabase} from '../../supabase.client';
import {EventService} from '../../../Services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css'],
  imports: [
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class CreateEventComponent {
  eventImage: string | ArrayBuffer | null = null;
  selectedFile?: File;

  event = {
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registerDeadline: '',
    maxAttendees: 0,
    location: '',
  };

  constructor(
    protected dialogRef: MatDialogRef<CreateEventComponent>,
    private eventService: EventService) {}

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.eventImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  async createEvent(): Promise<void> {
    const { startDate, startTime, endDate, endTime, registerDeadline } = this.event;

    // 🔒 Kiểm tra đầu vào cơ bản
    if (!startDate || !startTime || !endDate || !endTime || !registerDeadline) {
      alert('Vui lòng nhập đầy đủ ngày và giờ.');
      return;
    }

    const start = this.combineDateAndTime(startDate, startTime);
    const end = this.combineDateAndTime(endDate, endTime);
    const deadline = this.toDate(registerDeadline);

    if (!start || !end || !deadline) {
      alert('Ngày giờ không hợp lệ.');
      return;
    }

    if (end <= start) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    if (deadline > start) {
      alert('Hạn đăng ký không được sau ngày bắt đầu sự kiện.');
      return;
    }

    // 🔑 Lấy user hiện tại
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (sessionError || !userId) {
      alert('Không thể xác định người dùng.');
      return;
    }

    // 📤 Upload ảnh nếu có
    let imageUrl = '';
    if (this.selectedFile) {
      try {
        imageUrl = await this.eventService.uploadEventImage(this.selectedFile);
      } catch (err) {
        console.error('Lỗi upload ảnh:', err);
        alert('Không thể upload ảnh sự kiện');
        return;
      }
    }

    this.dialogRef.close({
      title: this.event.title,
      description: this.event.description,
      location: this.event.location,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      registration_deadline: deadline.toISOString(),
      max_participants: this.event.maxAttendees,
      image_url: imageUrl,
      created_by: userId,
    });

  }
  combineDateAndTime(date: any, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  toDate(date: any): Date | null {
    return date ? new Date(date) : null;
  }
}

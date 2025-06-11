import {Component, Inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconButton } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import {EventService} from '../../../../../../Services/event.service';
import {supabase} from '../../../../../supabase.client';
import {MatSlideToggle} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-edit-event-dialog',
  templateUrl: './edit-event-dialog.component.html',
  styleUrls: ['./edit-event-dialog.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconButton,
    MatSlideToggle
  ]
})
export class EditEventDialogComponent implements OnInit {
  eventImage: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private eventService: EventService
  ) {}

  ngOnInit() {
    if (this.data.is_hidden === undefined) {
      this.data.is_hidden = false;
    }
    if (this.data.participants === undefined){
      this.data.participants = 0;
    }
    this.eventImage = this.data.image_url || '';
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.data.image = file;
      const reader = new FileReader();
      reader.onload = () => (this.eventImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  async save() {
    const { startDate, startTime, endDate, endTime, registerDeadline } = this.data;

    const start = this.combineDateAndTime(startDate, startTime);
    const end = this.combineDateAndTime(endDate, endTime);
    const deadline = this.toDate(registerDeadline);

    if (!start || !end || !deadline) {
      alert('Vui lòng nhập đầy đủ ngày và giờ.');
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

    // Chuyển sang UTC (nếu cần offset +7)
    start.setHours(start.getHours() + 7);
    end.setHours(end.getHours() + 7);
    deadline.setHours(deadline.getHours() + 7);

    // Xử lý upload ảnh nếu có file mới
    let imageUrl = this.data.image_url;
    if (this.data.image instanceof File) {
      const file = this.data.image;
      const filePath = `events/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (error) {
        console.error('Lỗi khi tải ảnh lên:', error.message);
        alert('Không thể tải ảnh lên. Vui lòng thử lại.');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // Kiểm tra và chuyển đổi participants
    const maxParticipants = Number(this.data.participants);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      alert('Số lượng người tham gia phải là số dương.');
      return;
    }


    // Trả dữ liệu
    const updatePayload = {
      title: this.data.title,
      description: this.data.description,
      location: this.data.location,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      registration_deadline: deadline.toISOString(),
      max_participants: Number(this.data.participants),
      image_url: imageUrl,
      is_hidden: this.data.is_hidden
    };

    this.dialogRef.close(updatePayload);
  }


  cancel() {
    this.dialogRef.close();
  }

  private combineDateAndTime(date: any, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private toDate(date: any): Date | null {
    return date ? new Date(date) : null;
  }
}

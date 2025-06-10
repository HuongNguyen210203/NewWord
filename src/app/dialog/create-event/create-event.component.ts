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

import { supabase } from '../../supabase.client';
import { EventService } from '../../../Services/event.service';

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

  today: Date = new Date();

  event = {
    title: '',
    description: '',
    startDate: null as Date | null,
    startTime: '',
    endDate: null as Date | null,
    endTime: '',
    registerDeadline: null as Date | null,
    maxAttendees: 0,
    location: '',
  };

  constructor(
    protected dialogRef: MatDialogRef<CreateEventComponent>,
    private eventService: EventService
  ) {}

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

    if (!startDate || !startTime || !endDate || !endTime || !registerDeadline) {
      alert('Please fill in all date and time fields.');
      return;
    }

    const start = this.combineDateAndTime(startDate, startTime);
    const end = this.combineDateAndTime(endDate, endTime);
    const deadline = this.toDate(registerDeadline);

    if (!start || !end || !deadline) {
      alert('Invalid date or time.');
      return;
    }

    if (end <= start) {
      alert('End date must be after start date.');
      return;
    }

    if (deadline > start) {
      alert('Registration deadline cannot be after event start date.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (sessionError || !userId) {
      alert('Unable to identify user.');
      return;
    }

    let imageUrl = '';
    if (this.selectedFile) {
      try {
        imageUrl = await this.eventService.uploadEventImage(this.selectedFile);
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Failed to upload event image.');
        return;
      }
    }
    await this.eventService.createEvent({
      title: this.event.title,
      description: this.event.description,
      location: this.event.location,
      start_time: this.toLocalISOString(start),
      end_time: this.toLocalISOString(end),
      registration_deadline: this.toLocalISOString(deadline),
      max_participants: this.event.maxAttendees,
      image_url: imageUrl,
      created_by: userId,
      current_participants: 0,
      is_hidden: false,
    });
    this.dialogRef.close(); // đóng sau khi tạo

  }

  combineDateAndTime(date: Date, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  toDate(date: string | Date | null): Date | null {
    return date ? new Date(date) : null;
  }

  toLocalISOString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':00'
    );
  }
}

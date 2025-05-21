import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatIcon} from '@angular/material/icon';
import {NgIf} from '@angular/common';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';



@Component({
  selector: 'app-edit-event-dialog',
  standalone: true,
  imports: [
    // MatDialogTitle,
    FormsModule,
    MatLabel,
    MatInput,
    MatButton,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    ReactiveFormsModule,
    MatIcon,
    MatFormField,
    MatIconButton,
    MatDialogTitle,
    NgIf,
    NgxMaterialTimepickerModule,
  ],
  templateUrl: './edit-event-dialog.component.html',
  styleUrl: './edit-event-dialog.component.css'
})
export class EditEventDialogComponent {
  eventImage: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.eventImage = reader.result);
      reader.readAsDataURL(file);
      this.data.image = file;
    }
  }

  combineDateAndTime(date: any, time: string): Date | null {
    if (!date || !time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
  save() {
    const start = this.combineDateAndTime(this.data.startDate, this.data.startTime);
    const end = this.combineDateAndTime(this.data.endDate, this.data.endTime);

    if (!start || !end) {
      alert('Vui lòng điền đầy đủ ngày và giờ bắt đầu/kết thúc.');
      return;
    }

    if (end <= start) {
      alert('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    this.data.start = start;
    this.data.end = end;

    if (!this.data.eventDate || isNaN(new Date(this.data.eventDate).getTime())) {
      alert('Vui lòng chọn ngày diễn ra sự kiện.');
      return;
    }

    this.data.eventDate = new Date(this.data.eventDate); // ép lại đúng kiểu

    this.dialogRef.close(this.data);
  }

  cancel() {
    this.dialogRef.close();
  }
}

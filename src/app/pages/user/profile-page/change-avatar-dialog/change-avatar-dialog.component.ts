import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Các module Angular Material cần thiết
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-change-avatar-dialog',
  standalone: true,
  templateUrl: './change-avatar-dialog.component.html',
  styleUrls: ['./change-avatar-dialog.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltip
  ]
})
export class ChangeAvatarDialogComponent {
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChangeAvatarDialogComponent>
  ) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.data.user.avatar_url = this.previewUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    this.dialogRef.close(this.data.user);
  }
}

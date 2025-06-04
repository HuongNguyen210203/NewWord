import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';

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
  ],
})
export class ChangeAvatarDialogComponent {
  previewUrl: string | null = null;

  availableAvatars: string[] = [
    '/assets/images/avatar1.png',
    '/assets/images/avatar2.png',
    '/assets/images/avatar3.png',
    '/assets/images/avatar4.png',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChangeAvatarDialogComponent>
  ) {
    // Set default avatar if not set
    this.previewUrl = data.user.avatar_url || '/assets/images/avatar.png';
    if (!data.user.avatar_url) {
      data.user.avatar_url = '/assets/images/avatar.png';
    }
  }


  selectAvatar(path: string) {
    this.previewUrl = path;
    this.data.user.avatar_url = path;
  }

  saveChanges() {
    this.dialogRef.close(this.data.user);
  }
}

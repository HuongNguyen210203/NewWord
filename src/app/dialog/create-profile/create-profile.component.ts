import { Component, Inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-create-room',
  standalone: true,
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css'],
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogTitle
  ]
})
export class CreateProfileComponent {
  imagePreview: string | ArrayBuffer | null = null;

  profile = {
    email: '',
    name: '',
    joinedRooms: 0,
    events: 0
  };


  constructor(private dialogRef: MatDialogRef<CreateProfileComponent>) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  createProfile() {
    this.dialogRef.close({
      ...this.profile,
      email: this.profile.email,
      name: this.profile.name,
      joinedRooms: this.profile.joinedRooms,
      events: this.profile.events,
    });
  }
  onCancel() {
    this.dialogRef.close();
  }

}

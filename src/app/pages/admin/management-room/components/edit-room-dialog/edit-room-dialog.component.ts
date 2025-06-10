import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ChatService } from '../../../../../../Services/chat.service';
import { ChatRoom } from '../../../../../../Models/chat-room.model';

@Component({
  selector: 'app-edit-room-dialog',
  standalone: true,
  templateUrl: './edit-room-dialog.component.html',
  styleUrl: './edit-room-dialog.component.css',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
})
export class EditRoomDialogComponent {
  roomImage: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChatRoom & { image?: File },
    private chatService: ChatService
  ) {
    this.roomImage = data.image_url || null;
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => (this.roomImage = reader.result);
      reader.readAsDataURL(file);
      this.data.image = file;
    }
  }

  async save() {
    if (!this.data.name || this.data.name.trim().length === 0) {
      alert('Tên phòng không được để trống.');
      return;
    }

    let imageUrl = this.data.image_url;

    if (this.data.image instanceof File) {
      try {
        imageUrl = await this.chatService.uploadRoomImage(this.data.image);
      } catch (error) {
        alert('Tải ảnh lên thất bại.');
        return;
      }
    }

    const updatePayload = {
      name: this.data.name,
      description: this.data.description,
      image_url: imageUrl,
      is_hidden: this.data.is_hidden
    };

    this.dialogRef.close({
      ...this.data,
      ...updatePayload,
      image_url: imageUrl
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}

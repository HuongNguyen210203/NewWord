import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CommonModule } from '@angular/common';
import {ChatService} from '../../../../../../Services/chat.service';
import {ChatRoom} from '../../../../../../Models/chat-room.model';

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
  ],
})
export class EditRoomDialogComponent {
  roomImage: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChatRoom & { image?: File; members?: number },
    private chatService: ChatService
  ) {}

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg', 'image/webp','image/gif'].includes(file.type)){
      const reader = new FileReader();
      reader.onload = () => (this.roomImage = reader.result);
      reader.readAsDataURL(file);
      this.data.image = file;
    }
  }

  async save() {
    try {
      let imageUrl = this.data.image_url;

      // Chỉ upload nếu thực sự có file mới (PNG)
      if (this.data.image && this.data.image instanceof File) {
        imageUrl = await this.chatService.uploadRoomImage(this.data.image);
      }

      await this.chatService.updateRoom(this.data.id, {
        name: this.data.name,
        description: this.data.description,
        image_url: imageUrl // giữ nguyên ảnh cũ nếu không thay
      });

      this.dialogRef.close({
        ...this.data,
        image_url: imageUrl
      });

    } catch (error) {
      console.error('Lỗi khi cập nhật phòng:', error);
      alert('Không thể cập nhật phòng. Vui lòng thử lại.');

    }
  }
  cancel() {
    this.dialogRef.close();
  }
}

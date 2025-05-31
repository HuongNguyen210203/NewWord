import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {ChatService} from '../../../Services/chat.service';

// Angular Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-create-room',
  standalone: true,
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css'],
  imports: [
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class CreateRoomComponent {
  // Ảnh preview (dùng base64) để hiển thị
  imagePreview: string | ArrayBuffer | null = null;

  // File ảnh đã chọn, dùng để upload
  selectedFile?: File;

  // Dữ liệu nhập từ form
    room = {
    name: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<CreateRoomComponent>,
    private chatService: ChatService
  ) {}

  /**
   * Khi người dùng chọn file ảnh:
   * - Chỉ chấp nhận định dạng PNG
   * - Lưu vào biến selectedFile để upload
   * - Tạo base64 preview để hiển thị
   */
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        alert('Chỉ cho phép ảnh định dạng PNG');
        return;
      }
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  /**
   * Gửi dữ liệu phòng chat lên Supabase:
   * - Gồm tên, mô tả và ảnh (nếu có)
   * - Gọi ChatService.createRoom()
   * - Sau khi thành công → đóng dialog và trả về dữ liệu phòng
   */
  async createRoom() {
    if (!this.room.name.trim()) {
      alert('Vui lòng nhập tên phòng');
      return;
    }

    try {
      const createdRoom = await this.chatService.createRoom({
        name: this.room.name.trim(),
        description: this.room.description.trim(),
        imageFile: this.selectedFile
      });

      this.dialogRef.close(createdRoom);
      window.location.reload();
    } catch (error) {
      console.error('Lỗi khi tạo phòng:', error);
      alert('Không thể tạo phòng. Vui lòng thử lại.');
    }
  }

}

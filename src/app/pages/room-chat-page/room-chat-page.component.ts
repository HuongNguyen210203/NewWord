import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-chat-page',
  standalone: true,
  templateUrl: './room-chat-page.component.html',
  styleUrls: ['./room-chat-page.component.css'],
  imports: [
    CommonModule,
    NgFor,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class RoomChatPageComponent {
  // Danh sách hội thoại giả lập bên sidebar
  conversations = Array.from({ length: 7 }).map((_, i) => ({
    name: `Name ${i + 1}`,
    preview: 'Supporting line text lorem...',
    time: '10 min',
    avatar: `https://i.pravatar.cc/40?img=${i + 10}`
  }));

  // Tin nhắn mẫu
  messages = [
    { from: 'other', avatar: 'https://i.pravatar.cc/40?img=12' },
    { from: 'other', avatar: 'https://i.pravatar.cc/40?img=11' },
    { from: 'other', avatar: 'https://i.pravatar.cc/40?img=10' },
    { from: 'me', avatar: 'https://i.pravatar.cc/40?img=5' }
  ];

  // Gợi ý nhanh
  suggestions = ['Let’s do it', 'Great!', 'Great!'];

  // Nội dung input người dùng đang nhập
  inputMessage = '';

  sendMessage() {
    if (this.inputMessage.trim()) {
      this.messages.push({
        from: 'me',
        avatar: 'https://i.pravatar.cc/40?img=5'
      });
      this.inputMessage = '';
    }
  }

  sendSuggestion(text: string) {
    this.inputMessage = text;
    this.sendMessage();
  }
}

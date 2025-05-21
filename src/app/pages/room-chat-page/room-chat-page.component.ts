import { Component } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import {TopbarComponent} from '../../components/topbar/topbar.component';
import {SidebarComponent} from '../../components/sidebar/sidebar.component';

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
    MatButtonModule,
    TopbarComponent,
    SidebarComponent
  ]
})

export class RoomChatPageComponent {
  // Gợi ý tin nhắn nhanh
  suggestions: string[] = ['Let’s do it', 'Great!', 'Great!'];

  // Nội dung tin nhắn đang nhập
  inputMessage: string = '';

  // Phòng đang chọn (giả lập)
  activeRoom: any = {
    name: 'Alice',
    avatar: 'https://i.pravatar.cc/40?img=5'
  };

  // Danh sách cuộc trò chuyện
  chatRooms = [
    {
      name: 'Alice',
      preview: 'Bạn: Hello',
      time: '32 phút',
      avatar: 'https://i.pravatar.cc/40?img=5',
      active: true
    },
    {
      name: 'Nguyễn ',
      preview: 'Hoàng đã gửi một nhãn dán.',
      time: '42 phút',
      avatar: 'https://i.pravatar.cc/40?img=6',
      active: false
    },
    {
      name: 'Hoa',
      preview: '✌️',
      time: '44 phút',
      avatar: 'https://i.pravatar.cc/40?img=7',
      active: false
    },
    {
      name: 'Dyne',
      preview: 'Đã bày tỏ cảm xúc ❤️ về tin nhắn của bạn',
      time: '3 giờ',
      avatar: 'https://i.pravatar.cc/40?img=8',
      active: false
    },
    {
      name: 'Time ',
      preview: 'Happiness',
      time: '2 giờ',
      avatar: 'https://i.pravatar.cc/40?img=9',
      active: false
    }
  ];

  // Danh sách tin nhắn (giả lập)
  messages = [
    {
      from: 'other',
      avatar: 'https://i.pravatar.cc/40?img=5',
      text: 'Đây là nội dung tin nhắn đầu tiên từ người khác.'
    },
    {
      from: 'other',
      avatar: 'https://i.pravatar.cc/40?img=6',
      text: 'Một tin nhắn tiếp theo từ người khác.'
    },
    {
      from: 'me',
      avatar: 'https://i.pravatar.cc/40?img=10',
      text: 'Your message'
    }
  ];

  // Gửi tin nhắn
  sendMessage() {
    if (this.inputMessage.trim()) {
      this.messages.push({
        from: 'me',
        avatar: 'https://i.pravatar.cc/40?img=10',
        text: this.inputMessage
      });
      this.inputMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  // Gửi nhanh gợi ý
  sendSuggestion(text: string) {
    this.inputMessage = text;
    this.sendMessage();
  }

  // Cuộn xuống tin nhắn cuối cùng
  scrollToBottom() {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }

  // Chọn phòng chat
  selectRoom(room: any) {
    this.chatRooms.forEach(r => r.active = false);
    room.active = true;
    this.activeRoom = room;

    // Reset messages nếu cần
    this.messages = [
      {
        from: 'other',
        avatar: room.avatar,
        text: `Chào bạn, đây là đoạn chat với ${room.name}.`
      }
    ];
  }
}

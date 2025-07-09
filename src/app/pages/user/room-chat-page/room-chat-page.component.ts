import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../supabase.client';
import { ChatRoom } from '../../../../Models/chat-room.model';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ChatService } from '../../../../Services/chat.service';

@Component({
  selector: 'app-room-chat-page',
  standalone: true,
  templateUrl: './room-chat-page.component.html',
  styleUrls: ['./room-chat-page.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltip,
    EmojiModule,
    PickerComponent,
  ],
})
export class RoomChatPageComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  inputMessage = '';
  isJoined = false;
  showEmojiPicker = false;
  selectedFile: File | null = null;

  chatRooms: (ChatRoom & {
    preview?: string;
    time?: string;
    avatar?: string;
    active?: boolean;
    joined?: boolean;
    hover?: boolean;
  })[] = [];

  activeRoom: any = null;
  messages: {
    id: string;
    from: string;
    avatar: string;
    text: string;
    name: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }[] = [];

  private messageChannel: RealtimeChannel | null = null;
  private currentUserId: string = '';
  userAvatar: string = '/assets/images/avatar.png';

  constructor(private chatService: ChatService) {}

  normalizeHidden(value: any): boolean {
    return value === true || value === 'true';
  }

  async ngOnInit() {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? '';
    if (!userId) return;
    this.currentUserId = userId;

    const { data: userFromTable } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', this.currentUserId)
      .maybeSingle();

    this.userAvatar = userFromTable?.avatar_url || '/assets/images/avatar.png';
    const key = `viewedRooms-${this.currentUserId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    this.chatRooms = stored.map((room: any) => ({
      ...room,
      avatar: room.image_url || '/assets/images/avatar.png',
      preview: 'Chưa có tin nhắn',
      time: '',
      joined: false,
      active: false,
      hover: false,
      is_hidden: this.normalizeHidden(room.is_hidden),
    }));

    const { data: joinedRooms } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', this.currentUserId);

    const joinedRoomIds = new Set(joinedRooms?.map(r => r.room_id));
    this.chatRooms = this.chatRooms.map(room => ({
      ...room,
      joined: joinedRoomIds.has(room.id),
      preview: joinedRoomIds.has(room.id) ? 'Bạn đã tham gia phòng' : 'Chưa có tin nhắn',
    }));

    const roomFromNav = history.state?.room;
    if (roomFromNav) await this.addRoomAndSelect(roomFromNav);

    document.addEventListener('click', this.closeEmojiOutside, true);
    this.subscribeToRoomUpdates();
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeEmojiOutside, true);
    if (this.messageChannel) {
      supabase.removeChannel(this.messageChannel);
      this.messageChannel = null;
    }
  }

  subscribeToRoomUpdates() {
    if (this.messageChannel && this.messageChannel.state === 'joined') {
      supabase.removeChannel(this.messageChannel);
    }

    this.messageChannel = supabase
      .channel('room-hidden-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_rooms',
      }, payload => {
        const updated = payload.new;
        const index = this.chatRooms.findIndex(r => r.id === updated['id']);
        if (index !== -1) {
          this.chatRooms[index].is_hidden = this.normalizeHidden(updated['is_hidden']);
        }
        if (this.activeRoom?.id === updated['id']) {
          this.activeRoom.is_hidden = this.normalizeHidden(updated['is_hidden']);
          if (this.activeRoom.is_hidden && this.isJoined) {
            alert('🚫 Phòng này đã bị admin ẩn. Bạn không thể gửi tin nhắn.');
          }
        }
      })
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
      });
  }

  async addRoomAndSelect(room: ChatRoom) {
    const hasJoined = await this.chatService.isUserInRoom(room.id, this.currentUserId);
    const roomData = {
      ...room,
      avatar: room.image_url || '/assets/images/avatar.png',
      is_hidden: room.is_hidden ?? false,
      preview: hasJoined ? 'Bạn đã tham gia phòng' : 'Bạn chưa tham gia phòng',
      time: 'Vừa xong',
      joined: hasJoined,
      active: false,
      hover: false,
    };

    const index = this.chatRooms.findIndex(r => r.id === room.id);
    if (index === -1) {
      this.chatRooms.unshift(roomData);
      const key = `viewedRooms-${this.currentUserId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([roomData, ...current.filter((r: any) => r.id !== room.id)]));
    }

    await this.selectRoom(roomData);
  }

  async selectRoom(room: ChatRoom) {
    const hasJoined = await this.chatService.isUserInRoom(room.id, this.currentUserId);
    room.joined = hasJoined;
    room.active = true;
    this.isJoined = hasJoined;
    this.activeRoom = room;
    this.chatRooms.forEach(r => r.active = r.id === room.id);

    const messages = await this.chatService.getMessages(room.id);
    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    const { data: users } = await supabase
      .from('users')
      .select('id, avatar_url, name')
      .in('id', senderIds);

    const userMap: Record<string, { avatar_url: string; name: string }> = {};
    users?.forEach(u => {
      userMap[u.id] = {
        avatar_url: u.avatar_url || '/assets/images/avatar.png',
        name: u.name || 'Ẩn danh',
      };
    });

    this.messages = messages.map(msg => {
      const isMe = msg.sender_id === this.currentUserId;
      const sender = userMap[msg.sender_id] || { avatar_url: '/assets/images/avatar.png', name: 'Ẩn danh' };
      return {
        id: msg.id,
        from: isMe ? 'me' : 'other',
        avatar: isMe ? this.userAvatar : sender.avatar_url,
        name: isMe ? 'Bạn' : sender.name,
        text: msg.content,
        mediaUrl: msg.media_url,
        mediaType: msg.media_type === 'image' || msg.media_type === 'video' ? msg.media_type : undefined,
      };
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  async sendMessage() {
    const trimmed = this.inputMessage.trim();
    if (!trimmed || !this.currentUserId || !this.activeRoom) return;

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;

    if (this.selectedFile) {
      try {
        mediaUrl = await this.chatService.uploadFile(this.selectedFile, this.currentUserId);
        mediaType = this.selectedFile.type.startsWith('image/') ? 'image' : 'video';
      } catch (err: any) {
        alert(`❌ ${err.message}`);
        return;
      }
    }

    const success = await this.chatService.sendMessage(
      this.activeRoom.id,
      this.currentUserId,
      trimmed || (mediaType ? `${mediaType === 'image' ? 'Image' : 'Video'} message` : ''),
      mediaUrl,
      mediaType
    );

    if (success) {
      this.messages.push({
        id: Date.now().toString(),
        from: 'me',
        avatar: this.userAvatar,
        name: 'Bạn',
        text: trimmed || (mediaType ? `${mediaType === 'image' ? 'Image' : 'Video'} message` : ''),
        mediaUrl,
        mediaType,
      });
      this.inputMessage = '';
      this.selectedFile = null;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  async joinRoom() {
    if (!this.activeRoom || !this.currentUserId) return;
    const success = await this.chatService.joinRoom(this.activeRoom.id, this.currentUserId);
    if (success) {
      this.isJoined = true;
      this.activeRoom.joined = true;
      this.activeRoom.preview = 'Bạn đã tham gia phòng';
    }
  }

  async leaveRoom(event: Event, room: any) {
    event.stopPropagation();
    if (!this.currentUserId) return;
    const confirmed = confirm(`Bạn có chắc muốn rời khỏi "${room.name}"?`);
    if (!confirmed) return;
    await this.chatService.leaveRoom(room.id, this.currentUserId);
    const index = this.chatRooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      this.chatRooms[index].joined = false;
      this.chatRooms[index].preview = 'Bạn chưa tham gia phòng';
    }
    if (this.activeRoom?.id === room.id) {
      this.isJoined = false;
      this.activeRoom.joined = false;
      this.activeRoom.preview = 'Bạn chưa tham gia phòng';
    }
  }

  scrollToBottom() {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) chatContent.scrollTop = chatContent.scrollHeight;
  }

  toggleEmojiPicker(event: Event) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  closeEmojiOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.emoji-wrapper') && !target.closest('.emoji-toggle-icon')) {
      this.showEmojiPicker = false;
    }
  };

  addEmoji(event: any) {
    this.inputMessage += event.emoji.native;
    setTimeout(() => {
      const input = document.querySelector('.chat-input input') as HTMLInputElement;
      input?.focus();
    }, 50);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/images/avatar.png';
  }

  async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm'];

    if (validImageTypes.includes(fileType)) {
      this.selectedFile = file;
      await this.sendMessage();
    } else if (validVideoTypes.includes(fileType)) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = async () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          alert('❌ Video vượt quá 1 phút.');
          return;
        }
        this.selectedFile = file;
        await this.sendMessage();
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        alert('❌ Lỗi khi kiểm tra video.');
      };
      video.src = URL.createObjectURL(file);
    } else {
      alert('❌ Chỉ hỗ trợ ảnh (JPG, PNG, GIF) và video (MP4, WebM)');
    }

    input.value = '';
  }

  removeRoom(roomId: string) {
    const confirmed = confirm('Bạn có chắc muốn xoá phòng này khỏi danh sách hiển thị không?');
    if (!confirmed) return;

    this.chatRooms = this.chatRooms.filter(room => room.id !== roomId);

    const key = `viewedRooms-${this.currentUserId}`;
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = current.filter((room: any) => room.id !== roomId);
    localStorage.setItem(key, JSON.stringify(updated));

    if (this.activeRoom?.id === roomId) {
      this.activeRoom = null;
      this.messages = [];
    }
  }
}

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
  private currentUserId: string | null = null;
  userAvatar: string = '/assets/images/avatar.png';

  async ngOnInit() {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
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
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeEmojiOutside, true);
    if (this.messageChannel) supabase.removeChannel(this.messageChannel);
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

  async sendMessage() {
    const trimmed = this.inputMessage.trim();
    const file = this.selectedFile;
    const hasText = !!trimmed;
    const hasFile = !!file;

    if (!hasText && !hasFile) return;

    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;

    if (hasFile) {
      const ext = file.name.split('.').pop();
      const filePath = `media/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase
        .storage
        .from('chat-uploads')
        .upload(filePath, file);

      if (uploadError) {
        alert('❌ Upload thất bại: ' + uploadError.message);
        return;
      }

      const { data } = supabase
        .storage
        .from('chat-uploads')
        .getPublicUrl(filePath);

      mediaUrl = data.publicUrl;
      mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    }

    const { error } = await supabase.from('messages').insert({
      room_id: this.activeRoom.id,
      sender_id: this.currentUserId,
      content: trimmed || '',
      media_type: mediaType || 'text',
      media_url: mediaUrl || null,
      sent_at: new Date().toISOString(),
    });

    if (!error) {
      this.messages.push({
        id: Date.now().toString(),
        from: 'me',
        avatar: this.userAvatar,
        name: 'Bạn',
        text: trimmed,
        mediaType,
        mediaUrl,
      });

      const index = this.chatRooms.findIndex(r => r.id === this.activeRoom.id);
      if (index !== -1) {
        this.chatRooms[index].preview = trimmed ? `Bạn: ${trimmed}` : `[Đã gửi ${mediaType}]`;
        this.chatRooms[index].time = 'Vừa xong';
      }

      this.inputMessage = '';
      this.selectedFile = null;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  async joinRoom() {
    if (!this.activeRoom || !this.currentUserId) {
      alert('Vui lòng chọn một phòng.');
      return;
    }

    // Remove old participant record if exists
    await supabase
      .from('room_participants')
      .delete()
      .match({
        user_id: this.currentUserId,
        room_id: this.activeRoom.id,
      });

    // Insert new participant record to trigger update
    const { error } = await supabase
      .from('room_participants')
      .insert({
        user_id: this.currentUserId,
        room_id: this.activeRoom.id,
      });

    if (!error) {
      alert(`✅ Bạn đã tham gia phòng "${this.activeRoom.name}"`);
      this.isJoined = true;

      // Fetch updated room info (including active_members)
      const { data: updatedRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', this.activeRoom.id)
        .maybeSingle();

      if (updatedRoom) {
        const index = this.chatRooms.findIndex(r => r.id === updatedRoom.id);
        if (index !== -1) {
          this.chatRooms[index] = {
            ...this.chatRooms[index],
            ...updatedRoom,
            joined: true,
            preview: 'Bạn đã tham gia phòng',
          };
          this.activeRoom = this.chatRooms[index];
        }
      }

      await this.selectRoom(this.activeRoom);
    } else {
      alert('❌ Tham gia phòng thất bại: ' + error.message);
    }
  }
  async leaveRoom(event: Event, room: any) {
    event.stopPropagation();
    if (!this.currentUserId) return;

    const confirmed = confirm(`Bạn có chắc muốn rời khỏi "${room.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .match({ user_id: this.currentUserId, room_id: room.id });

    if (!error) {
      const index = this.chatRooms.findIndex(r => r.id === room.id);
      if (index !== -1) {
        this.chatRooms[index].joined = false;
        this.chatRooms[index].preview = 'Bạn chưa tham gia phòng';
        this.chatRooms[index].time = '';
      }

      if (this.activeRoom?.id === room.id) {
        this.isJoined = false;
        this.activeRoom.joined = false;
        this.activeRoom.preview = 'Bạn chưa tham gia phòng';
      }

      const key = `viewedRooms-${this.currentUserId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = stored.filter((r: any) => r.id !== room.id);
      localStorage.setItem(key, JSON.stringify(updated));

      alert(`🚪 Bạn đã rời khỏi phòng "${room.name}".`);
    } else {
      alert('❌ Lỗi khi rời phòng: ' + error.message);
    }
  }

  removeRoom(roomId: string) {
    this.chatRooms = this.chatRooms.filter(r => r.id !== roomId);
    const key = `viewedRooms-${this.currentUserId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = stored.filter((r: any) => r.id !== roomId);
    localStorage.setItem(key, JSON.stringify(updated));

    if (this.activeRoom?.id === roomId) {
      this.activeRoom = null;
      this.isJoined = false;
      this.messages = [];
    }

    alert('✅ Đã xoá phòng khỏi danh sách Conversations.');
  }


  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      this.selectedFile = file;
    } else if (fileType.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 60) {
          alert('❌ Video vượt quá 1 phút.');
          return;
        }
        this.selectedFile = file;
      };
      video.src = URL.createObjectURL(file);
    } else {
      alert('❌ Chỉ hỗ trợ ảnh (JPG, PNG, GIF) và video (MP4, WebM)');
    }

    input.value = '';
  }

  async addRoomAndSelect(room: any) {
    const { data: exists } = await supabase
      .from('room_participants')
      .select('id')
      .eq('user_id', this.currentUserId)
      .eq('room_id', room.id)
      .maybeSingle();

    const hasJoined = !!exists;

    const roomData = {
      ...room,
      avatar: room.image_url || '/assets/images/avatar.png',
      preview: hasJoined ? 'Bạn đã tham gia phòng' : 'Bạn chưa tham gia phòng',
      time: 'Vừa xong',
      joined: hasJoined,
      active: false,
      hover: false,
    };

    if (!this.chatRooms.some(r => r.id === room.id)) {
      this.chatRooms.unshift(roomData);
      const key = `viewedRooms-${this.currentUserId}`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([roomData, ...current.filter((r: any) => r.id !== room.id)]));
    }

    await this.selectRoom(roomData);
  }

  async selectRoom(room: any) {
    const { data: joined } = await supabase
      .from('room_participants')
      .select('id')
      .eq('room_id', room.id)
      .eq('user_id', this.currentUserId)
      .maybeSingle();

    room.joined = !!joined;
    room.active = true;
    this.isJoined = room.joined;
    this.activeRoom = room;

    this.chatRooms.forEach(r => (r.active = r.id === room.id));

    await this.loadMessages(room.id);
    this.subscribeToMessages(room.id);
  }

  async loadMessages(roomId: string) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('sent_at', { ascending: true });

    const senderIds = [...new Set(messages!.map(m => m['sender_id']))];
    const { data: users } = await supabase
      .from('users')
      .select('id, avatar_url, name')
      .in('id', senderIds);

    const defaultAvatar = '/assets/images/avatar.png';
    const userMap: Record<string, { avatar_url: string; name: string }> = {};
    users?.forEach(u => {
      userMap[u.id] = {
        avatar_url: u.avatar_url || defaultAvatar,
        name: u.name || 'Ẩn danh',
      };
    });

    this.messages = messages!.map(msg => {
      const isMe = msg['sender_id'] === this.currentUserId;
      const sender = userMap[msg['sender_id']] || { avatar_url: defaultAvatar, name: 'Ẩn danh' };
      return {
        id: msg['id'],
        from: isMe ? 'me' : 'other',
        avatar: isMe ? this.userAvatar : sender.avatar_url,
        name: isMe ? 'Bạn' : sender.name,
        text: msg['content'],
        mediaUrl: msg['media_url'],
        mediaType: msg['media_type'],
      };
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  subscribeToMessages(roomId: string) {
    if (this.messageChannel) {
      supabase.removeChannel(this.messageChannel);
    }

    this.messageChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const msg = payload.new;
          if (msg['sender_id'] === this.currentUserId) return;

          const { data: user } = await supabase
            .from('users')
            .select('avatar_url, name')
            .eq('id', msg['sender_id'])
            .single();

          this.messages.push({
            id: msg['id'],
            from: 'other',
            avatar: user?.avatar_url || '/assets/images/avatar.png',
            name: user?.name || 'Ẩn danh',
            text: msg['content'],
            mediaUrl: msg['media_url'],
            mediaType: msg['media_type'],
          });

          setTimeout(() => this.scrollToBottom(), 100);
        }
      )
      .subscribe();
  }

  scrollToBottom() {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) chatContent.scrollTop = chatContent.scrollHeight;
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/images/avatar.png';
  }

  sendSuggestion(text: string) {
    this.inputMessage = text;
    this.sendMessage();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

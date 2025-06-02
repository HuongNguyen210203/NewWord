import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../../../supabase.client';
import { ChatRoom } from '../../../../Models/chat-room.model';

@Component({
  selector: 'app-room-chat-page',
  standalone: true,
  templateUrl: './room-chat-page.component.html',
  styleUrls: ['./room-chat-page.component.css'],
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltip],
})
export class RoomChatPageComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  inputMessage = '';
  isJoined = false;

  chatRooms: (ChatRoom & {
    preview?: string;
    time?: string;
    avatar?: string;
    active?: boolean;
    joined?: boolean;
    hover?: boolean;
  })[] = [];

  activeRoom: any = null;
  messages: { from: string; avatar: string; text: string; name: string }[] = [];

  private messageChannel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;
  userAvatar: string = '/assets/images/avatar.png';

  async ngOnInit() {
    // Lấy user đang đăng nhập
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      console.error('❌ Không tìm thấy người dùng đăng nhập.');
      return;
    }

    this.currentUserId = userId;

    // 🔄 Lấy avatar từ bảng users thay vì user_metadata
    const { data: userFromTable, error: userTableError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', this.currentUserId)
      .maybeSingle();

    if (userTableError) {
      console.warn('⚠️ Không thể lấy avatar từ bảng users:', userTableError.message);
    }

    this.userAvatar = userFromTable?.avatar_url || '/assets/images/avatar.png';

    // Lấy danh sách phòng từ localStorage
    const stored = JSON.parse(localStorage.getItem('viewedRooms') || '[]');
    this.chatRooms = stored.map((room: any) => ({
      ...room,
      avatar: room.image_url || '/assets/images/avatar.png',
      preview: 'Chưa có tin nhắn',
      time: '',
      joined: false,
      active: false,
      hover: false,
    }));

    // Kiểm tra những phòng đã tham gia
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

    // Nếu điều hướng đến từ nơi khác có truyền room
    const roomFromNav = history.state?.room;
    if (roomFromNav) await this.addRoomAndSelect(roomFromNav);
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
      const current = JSON.parse(localStorage.getItem('viewedRooms') || '[]');
      localStorage.setItem('viewedRooms', JSON.stringify([roomData, ...current.filter((r: any) => r.id !== room.id)]));
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
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('sent_at', { ascending: true });

    if (error || !messages) return;

    const senderIds = [...new Set(messages.map(m => m['sender_id']))];
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

    this.messages = messages.map(msg => {
      const isMe = msg['sender_id'] === this.currentUserId;
      const sender = userMap[msg['sender_id']] || { avatar_url: defaultAvatar, name: 'Ẩn danh' };
      return {
        from: isMe ? 'me' : 'other',
        avatar: isMe ? this.userAvatar : sender.avatar_url,
        name: isMe ? 'Bạn' : sender.name,
        text: msg['content'],
      };
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  async sendMessage() {
    const trimmed = this.inputMessage.trim();
    if (!trimmed || !this.activeRoom || !this.currentUserId) return;

    const { error } = await supabase.from('messages').insert({
      room_id: this.activeRoom.id,
      sender_id: this.currentUserId,
      content: trimmed,
      media_type: 'text',
      media_url: null,
      sent_at: new Date().toISOString(),
    });

    if (!error) {
      this.messages.push({
        from: 'me',
        avatar: this.userAvatar,
        name: 'Bạn',
        text: trimmed,
      });

      const index = this.chatRooms.findIndex(r => r.id === this.activeRoom.id);
      if (index !== -1) {
        this.chatRooms[index].preview = `Bạn: ${trimmed}`;
        this.chatRooms[index].time = 'Vừa xong';
      }

      this.inputMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      console.error('❌ Gửi tin nhắn thất bại:', error.message);
    }
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
            from: 'other',
            avatar: user?.avatar_url || '/assets/images/avatar.png',
            name: user?.name || 'Ẩn danh',
            text: msg['content'],
          });

          setTimeout(() => this.scrollToBottom(), 100);
        }
      )
      .subscribe();
  }

  async joinRoom() {
    if (!this.activeRoom || !this.currentUserId) return alert('Vui lòng chọn một phòng.');

    const { error } = await supabase
      .from('room_participants')
      .upsert({ user_id: this.currentUserId, room_id: this.activeRoom.id }, { onConflict: 'user_id,room_id' });

    if (!error) {
      alert(`✅ Bạn đã tham gia phòng "${this.activeRoom.name}"`);
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
      .match({
        user_id: this.currentUserId,
        room_id: room.id
      });

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

      // Xoá khỏi localStorage
      const stored = JSON.parse(localStorage.getItem('viewedRooms') || '[]');
      const updated = stored.filter((r: any) => r.id !== room.id);
      localStorage.setItem('viewedRooms', JSON.stringify(updated));

      await this.ngOnInit(); // Reload UI đúng preview
    } else {
      alert('❌ Rời phòng thất bại: ' + error.message);
    }
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

  removeRoom(roomId: string) {
    // Xóa khỏi chatRooms hiển thị
    this.chatRooms = this.chatRooms.filter(r => r.id !== roomId);

    // Xóa khỏi localStorage
    const stored = JSON.parse(localStorage.getItem('viewedRooms') || '[]');
    const updated = stored.filter((r: any) => r.id !== roomId);
    localStorage.setItem('viewedRooms', JSON.stringify(updated));

    // Nếu phòng bị xóa là phòng đang mở, reset view
    if (this.activeRoom?.id === roomId) {
      this.activeRoom = null;
      this.isJoined = false;
      this.messages = [];
    }

    alert('✅ Đã xoá phòng khỏi danh sách Conversations.');
  }

  ngOnDestroy() {
    if (this.messageChannel) supabase.removeChannel(this.messageChannel);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../../supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatRoom } from '../../../../Models/chat-room.model';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-room-chat-page',
  standalone: true,
  templateUrl: './room-chat-page.component.html',
  styleUrls: ['./room-chat-page.component.css'],
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltip],
})
export class RoomChatPageComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  suggestions: string[] = ['Let’s do it', 'Great!', 'Nice idea!'];
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
  userAvatar: string = '/assets/images/avatar.png'; // Đường dẫn mặc định

  async ngOnInit() {
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

    const user = await supabase.auth.getUser();
    this.currentUserId = user.data.user?.id ?? null;
    this.userAvatar = user.data.user?.user_metadata?.['avatar_url'] || '/assets/images/avatar.png'; // Gọi avatar từ Supabase
    if (!this.currentUserId) return;

    const { data: joinedRooms } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', this.currentUserId);

    const joinedRoomIds = new Set(joinedRooms?.map((r) => r.room_id));
    this.chatRooms = this.chatRooms.map((room) => ({
      ...room,
      joined: joinedRoomIds.has(room.id),
      preview: joinedRoomIds.has(room.id)
        ? 'Bạn đã tham gia phòng'
        : room.preview,
    }));

    const roomFromNav = history.state?.room;
    if (roomFromNav) {
      await this.addRoomAndSelect(roomFromNav);
    }
  }

  async addRoomAndSelect(room: any) {
    const { data: exists } = await supabase
      .from('room_participants')
      .select('id')
      .eq('user_id', this.currentUserId)
      .eq('room_id', room.id)
      .single();

    const hasJoined = !!exists;

    const roomData = {
      ...room,
      avatar: room.image_url || '/assets/images/avatar.png',
      preview: hasJoined ? 'Bạn đã tham gia phòng' : 'Bạn chưa tham gia',
      time: 'Vừa xong',
      joined: hasJoined,
      active: false,
      hover: false,
    };

    const existsInList = this.chatRooms.some((r) => r.id === room.id);
    if (!existsInList) {
      this.chatRooms.unshift(roomData);

      const current = JSON.parse(localStorage.getItem('viewedRooms') || '[]');
      localStorage.setItem(
        'viewedRooms',
        JSON.stringify([roomData, ...current.filter((r: any) => r.id !== room.id)])
      );
    }

    await this.selectRoom(roomData);
  }

  async selectRoom(room: any) {
    this.chatRooms.forEach((r) => (r.active = false));
    room.active = true;
    this.activeRoom = room;
    this.isJoined = !!room.joined;

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

    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];

    const { data: users } = await supabase
      .from('users')
      .select('id, avatar_url, name')
      .in('id', senderIds);

    const defaultAvatar = '/assets/images/avatar.png';

    const userMap: Record<string, { avatar_url: string; name: string }> = {};
    users?.forEach(user => {
      userMap[user.id] = {
        avatar_url: user.avatar_url || defaultAvatar,
        name: user.name || 'Ẩn danh',
      };
    });

    this.messages = messages.map(msg => {
      const isMe = msg.sender_id === this.currentUserId;
      const sender = userMap[msg.sender_id] || { avatar_url: defaultAvatar, name: 'Ẩn danh' };

      return {
        from: isMe ? 'me' : 'other',
        avatar: isMe ? this.userAvatar : sender.avatar_url,
        name: isMe ? 'Bạn' : sender.name,
        text: msg.content,
      };
    });

    setTimeout(() => this.scrollToBottom(), 100);
  }

  async joinRoom() {
    if (!this.activeRoom) {
      alert('Vui lòng chọn một phòng trước khi tham gia.');
      return;
    }

    const { error } = await supabase.from('room_participants').upsert(
      {
        user_id: this.currentUserId,
        room_id: this.activeRoom.id,
      },
      { onConflict: 'user_id,room_id' }
    );

    if (!error) {
      this.isJoined = true;

      const index = this.chatRooms.findIndex(
        (r) => r.id === this.activeRoom.id
      );
      if (index !== -1) {
        this.chatRooms[index].joined = true;
        this.chatRooms[index].preview = 'Bạn đã tham gia phòng';
        this.chatRooms[index].time = 'Vừa xong';
      }

      this.messages.push({
        from: 'other',
        avatar: this.activeRoom.avatar,
        name: this.activeRoom.name || 'Hệ thống',
        text: `Bạn đã tham gia ${this.activeRoom.name}!`,
      });
    } else {
      console.error('Join room failed:', error.message);
    }
  }

  async sendMessage(): Promise<void> {
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

      const index = this.chatRooms.findIndex(
        (room) => room.id === this.activeRoom.id
      );
      if (index !== -1) {
        this.chatRooms[index].preview = `Bạn: ${trimmed}`;
        this.chatRooms[index].time = 'Vừa xong';
      }

      this.inputMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    } else {
      console.error('Gửi tin nhắn thất bại:', error.message);
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

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/images/avatar.png';
  }

  ngOnDestroy() {
    if (this.messageChannel) {
      supabase.removeChannel(this.messageChannel);
    }
  }

  sendSuggestion(text: string) {
    this.inputMessage = text;
    this.sendMessage();
  }

  scrollToBottom() {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }
  async leaveRoom(event: Event, room: any) {
    event.stopPropagation();

    const confirmed = confirm(`Bạn có chắc muốn rời khỏi "${room.name}"?`);
    if (!confirmed || !this.currentUserId) return;

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('user_id', this.currentUserId)
      .eq('room_id', room.id);

    if (!error) {
      // Cập nhật UI và localStorage
      this.chatRooms = this.chatRooms.filter(r => r.id !== room.id);
      localStorage.setItem('viewedRooms', JSON.stringify(this.chatRooms));

      if (this.activeRoom?.id === room.id) {
        this.activeRoom = null;
        this.messages = [];
        this.isJoined = false;
      }
    } else {
      alert('Rời phòng thất bại: ' + error.message);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}

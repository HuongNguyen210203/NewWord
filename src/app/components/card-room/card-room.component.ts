import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgStyle } from '@angular/common';
import { ChatRoom } from '../../../Models/chat-room.model';
import { supabase } from '../../supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MaterialModule } from '../../modules/material/material.module';

@Component({
  selector: 'app-card-room',
  standalone: true,
  templateUrl: './card-room.component.html',
  styleUrl: './card-room.component.css',
  imports: [MaterialModule, NgStyle, NgClass],
})
export class CardRoomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() room!: ChatRoom;

  activeCount = 0;
  private chatRoomChannel?: RealtimeChannel;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.refreshRoomStatus();
    this.subscribeToRealtime();
  }

  async ngOnChanges() {
    await this.refreshRoomStatus();
    this.subscribeToRealtime();
  }

  ngOnDestroy() {
    if (this.chatRoomChannel) {
      supabase.removeChannel(this.chatRoomChannel);
    }
  }

  async refreshRoomStatus() {
    if (!this.room?.id) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .select('active_members, is_hidden')
      .eq('id', this.room.id)
      .single();

    if (!error && data) {
      this.activeCount = data.active_members || 0;
      this.room.is_hidden = data.is_hidden ?? false;
    } else {
      console.error('❌ Lỗi lấy trạng thái phòng:', error?.message);
    }
  }

  subscribeToRealtime() {
    if (!this.room?.id) return;

    if (this.chatRoomChannel) {
      supabase.removeChannel(this.chatRoomChannel);
    }

    this.chatRoomChannel = supabase
      .channel(`chat_rooms:${this.room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
          filter: `id=eq.${this.room.id}`,
        },
        (payload) => {
          const updated = payload.new as Partial<ChatRoom>;

          if (updated.active_members !== undefined) {
            this.activeCount = updated.active_members;
          }

          if (updated.is_hidden !== undefined) {
            this.room.is_hidden = updated.is_hidden;
            console.log('[CardRoom] is_hidden updated:', updated.is_hidden);
          }
        }
      )
      .subscribe();
  }

  goToChatRoom() {
    this.router.navigate(['/chat'], { state: { room: this.room } });
  }
}

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgStyle } from '@angular/common';
import { ChatRoom } from '../../../Models/chat-room.model';
import { supabase } from '../../supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MaterialModule } from '../../modules/material/material.module';

@Component({
  selector: 'app-card-room',
  standalone: true,
  templateUrl: './card-room.component.html',
  styleUrl: './card-room.component.css',
  imports: [MaterialModule, NgStyle],
})
export class CardRoomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() room!: ChatRoom;

  activeCount = 0;
  private chatRoomChannel?: RealtimeChannel;

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.refreshActiveCount();
    this.subscribeToRealtime();
  }

  async ngOnChanges() {
    await this.refreshActiveCount();
    this.subscribeToRealtime();
  }

  ngOnDestroy() {
    if (this.chatRoomChannel) {
      supabase.removeChannel(this.chatRoomChannel);
    }
  }

  async refreshActiveCount() {
    if (!this.room?.id) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .select('active_members')
      .eq('id', this.room.id)
      .single();

    if (!error && data) {
      this.activeCount = data.active_members || 0;
    } else {
      console.error('❌ Lỗi lấy active_members:', error?.message);
      this.activeCount = 0;
    }
  }

  subscribeToRealtime() {
    if (!this.room?.id) return;

    // Xóa channel cũ nếu tồn tại
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
          const updated = payload.new;
          if (updated?.['active_members'] !== undefined) {
            this.activeCount = updated['active_members'];
          }
        }
      )
      .subscribe();
  }

  goToChatRoom() {
    this.router.navigate(['/chat'], { state: { room: this.room } });
  }
}

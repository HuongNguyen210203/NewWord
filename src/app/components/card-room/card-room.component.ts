import { Component, Input, OnChanges } from '@angular/core';
import { MaterialModule } from '../../modules/material/material.module';
import { ChatRoom } from '../../../Models/chat-room.model';
import { Router } from '@angular/router';
import { NgStyle } from '@angular/common';
import { supabase } from '../../supabase.client';

@Component({
  selector: 'app-card-room',
  standalone: true,
  templateUrl: './card-room.component.html',
  styleUrl: './card-room.component.css',
  imports: [MaterialModule, NgStyle],
})
export class CardRoomComponent implements OnChanges {
  @Input() room!: ChatRoom;

  activeCount: number = 0;

  constructor(private router: Router) {}

  async ngOnChanges() {
    if (this.room?.id) {
      this.activeCount = await this.getActiveMemberCount(this.room.id);
    }
  }

  goToChatRoom() {
    this.router.navigate(['/chat'], { state: { room: this.room } });
  }

  async getActiveMemberCount(roomId: string): Promise<number> {
    const { count, error } = await supabase
      .from('room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (error) {
      console.error('Lỗi khi lấy số lượng thành viên:', error.message);
      return 0;
    }
    return count || 0;
  }
}

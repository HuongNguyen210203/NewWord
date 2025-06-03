import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { supabase } from '../../supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  standalone: true,
  selector: 'app-join-event-dialog',
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    MatButtonModule,
  ],
  providers: [DatePipe],
  templateUrl: './join-event-dialog.component.html',
  styleUrl: './join-event-dialog.component.css',
})
export class JoinEventDialogComponent implements OnInit, OnDestroy {
  loading = false;
  hasJoined = false;
  private channel?: RealtimeChannel;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  async ngOnInit() {
    await this.checkJoined();
    await this.refreshParticipantCount();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    if (this.channel) supabase.removeChannel(this.channel);
  }

  async refreshParticipantCount() {
    const { data, error } = await supabase
      .from('events')
      .select('current_participants')
      .eq('id', this.data.id)
      .maybeSingle();

    if (!error && data) {
      this.data.current_participants = data.current_participants;
    } else {
      this.data.current_participants = 0;
    }
  }

  subscribeToRealtime() {
    if (!this.data?.id) return;

    this.channel = supabase
      .channel(`events:${this.data.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${this.data.id}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated?.['current_participants'] !== undefined) {
            this.data.current_participants = updated['current_participants'];
          }
        }
      )
      .subscribe();
  }

  async checkJoined() {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', this.data.id)
      .maybeSingle();

    this.hasJoined = !!data && !error;
  }

  async toggleRegistration() {
    this.loading = true;
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      alert('❌ Bạn cần đăng nhập để thực hiện hành động này.');
      this.loading = false;
      return;
    }

    if (this.hasJoined) {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .match({ user_id: userId, event_id: this.data.id });

      if (!error) {
        this.hasJoined = false;
        alert('❌ Bạn đã huỷ đăng ký sự kiện.');
      } else {
        alert('❌ Huỷ đăng ký thất bại: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('event_participants').insert({
        user_id: userId,
        event_id: this.data.id,
        status: 'active',
        is_moderator: false,
        registered_at: new Date().toISOString(),
      });

      if (!error) {
        this.hasJoined = true;
        alert('✅ Bạn đã đăng ký thành công!');
      } else {
        alert('❌ Đăng ký thất bại: ' + error.message);
      }
    }

    this.loading = false;
  }
}

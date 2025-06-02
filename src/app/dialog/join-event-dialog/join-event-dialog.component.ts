import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {CommonModule, DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {supabase} from '../../supabase.client';

@Component({
  standalone: true,
  selector: 'app-join-event-dialog',
  imports: [
    CommonModule,
    MatDialogContent,
    MatButtonModule,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
  ],
  providers: [DatePipe],
  templateUrl: './join-event-dialog.component.html',
  styleUrl: './join-event-dialog.component.css'
})
export class JoinEventDialogComponent implements OnInit {
  loading = false;
  hasJoined = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  async ngOnInit() {
    await this.checkJoined();
    await this.refreshParticipantCount();
  }

  async refreshParticipantCount() {
    const { count, error } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', this.data.id);

    if (!error) {
      this.data.current_participants = count || 0;
    } else {
      console.warn('⚠️ Không thể lấy số người tham gia:', error.message);
      this.data.current_participants = 0;
    }
  }


  async checkJoined() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', this.data.id)
      .maybeSingle();

    this.hasJoined = !!data;
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
      // ❌ Huỷ đăng ký
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .match({ user_id: userId, event_id: this.data.id });

      if (!error) {
        alert('❌ Bạn đã huỷ đăng ký sự kiện.');
        this.hasJoined = false;
        this.data.current_participants = Math.max(0, this.data.current_participants - 1);
      } else {
        alert('❌ Huỷ đăng ký thất bại: ' + error.message);
      }
    } else {
      // ✅ Đăng ký
      const { error } = await supabase.from('event_participants').insert({
        user_id: userId,
        event_id: this.data.id,
        status: 'active',
        is_moderator: false,
        registered_at: new Date().toISOString(),
      });

      if (!error) {
        alert('✅ Bạn đã đăng ký thành công!');
        this.hasJoined = true;
        this.data.current_participants = (this.data.current_participants || 0) + 1;
      } else {
        alert('❌ Đăng ký thất bại: ' + error.message);
      }
    }

    this.loading = false;
  }
}

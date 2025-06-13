import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle
} from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../supabase.client';
import { EventService } from '../../../Services/event.service';

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
    MatIcon,
  ],
  providers: [DatePipe],
  templateUrl: './join-event-dialog.component.html',
  styleUrl: './join-event-dialog.component.css',
})
export class JoinEventDialogComponent implements OnInit, OnDestroy {
  loading = false;
  hasJoined = false;
  userId: string | undefined;
  conflictEvent?: any;
  private channel?: RealtimeChannel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<JoinEventDialogComponent>,
    private eventService: EventService
  ) {}

  async ngOnInit() {
    const { data: authData } = await supabase.auth.getUser();
    this.userId = authData.user?.id;
    if (!this.userId) return;

    await this.checkJoined();
    await this.refreshParticipantCount();
    await this.checkTimeConflict();
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
    if (!this.userId) return;
    this.hasJoined = await this.eventService.hasJoined(this.userId, this.data.id);
  }

  async checkTimeConflict() {
    if (!this.userId) return;

    const { data: joinedEvents, error } = await supabase
      .from('event_participants')
      .select('event_id, events!inner(id, title, start_time, end_time)')
      .eq('user_id', this.userId);

    if (error) return;

    const events = (joinedEvents || []).map((e: any) => e.events);
    const current = this.data;

    const overlap = events.find((e: any) =>
      new Date(e.start_time) < new Date(current.end_time) &&
      new Date(e.end_time) > new Date(current.start_time) &&
      e.id !== current.id
    );

    if (overlap) {
      this.conflictEvent = overlap;
    }
  }

  async toggleRegistration() {
    this.loading = true;

    if (!this.userId) {
      alert('❌ You must be logged in to perform this action.');
      this.loading = false;
      return;
    }

    if (!this.hasJoined && this.conflictEvent) {
      const confirmed = confirm(
        `⚠ You have already joined "${this.conflictEvent.title}" which overlaps with this event. Do you want to proceed?`
      );
      if (!confirmed) {
        this.loading = false;
        return;
      }
    }

    try {
      if (this.hasJoined) {
        await this.eventService.leaveEvent(this.userId, this.data.id);
        this.hasJoined = false;
        alert('❌ You have left the event.');
        this.dialogRef.close({ cancelledEventId: this.data.id });
      } else {
        await this.eventService.joinEvent(this.userId, this.data.id);
        this.hasJoined = true;
        alert('✅ You have successfully registered!');
        this.dialogRef.close();
      }
    } catch (error: any) {
      alert(`❌ Action failed: ${error.message}`);
    }

    this.loading = false;
  }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MaterialModule } from '../../modules/material/material.module';
import { JoinEventDialogComponent } from '../../dialog/join-event-dialog/join-event-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AppEvent } from '../../../Models/event.model';
import { NgClass } from '@angular/common';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../supabase.client';

@Component({
  selector: 'app-card-event',
  standalone: true,
  templateUrl: './card-event.component.html',
  imports: [
    MatCardContent,
    MatCard,
    MaterialModule,
    NgClass,
  ],
  styleUrls: ['./card-event.component.scss']
})
export class CardEventComponent implements OnInit, OnDestroy {
  @Input() event!: AppEvent;
  private eventChannel?: RealtimeChannel;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscribeToEventChanges();
  }

  ngOnDestroy(): void {
    if (this.eventChannel) {
      supabase.removeChannel(this.eventChannel);
    }
  }

  subscribeToEventChanges() {
    if (!this.event?.id) return;

    this.eventChannel = supabase
      .channel(`events:${this.event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${this.event.id}`
        },
        (payload) => {
          const updated = payload.new as Partial<AppEvent>;
          if (updated) {
            this.event.is_hidden = updated.is_hidden ?? this.event.is_hidden;
            this.event.current_participants = updated.current_participants ?? this.event.current_participants;
            console.log('[CardEvent] Real-time update:', this.event);
          }
        }
      )
      .subscribe();
  }

  openDialog() {
    this.dialog.open(JoinEventDialogComponent, {
      width: '500px',
      data: {
        ...this.event
      }
    });
  }

  get safeImageUrl(): string {
    return this.event.image_url || 'https://via.placeholder.com/300x200?text=No+Image';
  }

  getMonthLabel(): string {
    const date = new Date(this.event.start_time);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  }

  getDayLabel(): string {
    const date = new Date(this.event.start_time);
    return isNaN(date.getTime()) ? '' : String(date.getDate()).padStart(2, '0');
  }
}

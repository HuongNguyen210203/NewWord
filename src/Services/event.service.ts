import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { AppEvent } from '../Models/event.model';
import { RealtimeChannel } from '@supabase/supabase-js';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private eventChannel?: RealtimeChannel;

  constructor(private notificationService: NotificationService) {}

  async getAllEvents(): Promise<AppEvent[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return events as AppEvent[];
  }

  async createEvent(event: Omit<AppEvent, 'id' | 'created_at'>): Promise<AppEvent> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async uploadEventImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('event-images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('event-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
  }

  async updateEvent(eventId: string, updatedFields: Partial<AppEvent>): Promise<AppEvent> {
    const { data, error } = await supabase
      .from('events')
      .update(updatedFields)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    const { data: participants } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', eventId);

    const participantIds = participants?.map(p => p.user_id) || [];

    await this.notificationService.notifyParticipants(participantIds, {
      type: 'event',
      action: 'updated',
      target_id: eventId,
      title: 'Event Updated',
      message: `The event <b>${data.title}</b> you joined has been updated. Please check for changes.`,
    });

    return data;
  }

  async joinEvent(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase.from('event_participants').insert({
      user_id: userId,
      event_id: eventId,
      registered_at: new Date().toISOString(),
    });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    const { data: event } = await supabase
      .from('events')
      .select('id, title, max_participants, current_participants')
      .eq('id', eventId)
      .maybeSingle();

    await this.notificationService.notifyAllAdmins({
      type: 'event',
      action: 'registered',
      target_id: eventId,
      title: 'New Event Registration',
      message: `<b>${userData?.email}</b> has registered for event <b>${event?.title}</b>.`,
    });

    if (event && event.current_participants + 1 >= event.max_participants) {
      await this.notificationService.notifyAllAdmins({
        type: 'event',
        action: 'full',
        target_id: eventId,
        title: 'Event Full',
        message: `Event <b>${event.title}</b> is now full.`,
      });
    }
  }

  async leaveEvent(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ user_id: userId, event_id: eventId });

    if (error) throw error;

    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    const { data: event } = await supabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .maybeSingle();

    await this.notificationService.notifyAllAdmins({
      type: 'event',
      action: 'left',
      target_id: eventId,
      title: 'User Left Event',
      message: `<b>${userData?.email}</b> has left event <b>${event?.title}</b>.`,
    });
  }

  async hasJoined(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  subscribeToEvents(onUpdate: () => void) {
    this.eventChannel = supabase.channel('events-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, payload => {
        console.log('📡 Event change detected:', payload);
        onUpdate();
      })
      .subscribe();
  }

  unsubscribeEvents() {
    if (this.eventChannel) {
      supabase.removeChannel(this.eventChannel);
      this.eventChannel = undefined;
    }
  }
}

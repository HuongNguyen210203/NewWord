import { Injectable } from '@angular/core';
import {supabase} from '../app/supabase.client';
import { AppEvent } from '../Models/event.model';
import {RealtimeChannel} from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class EventService {
  private eventChannel?: RealtimeChannel;
  async getAllEvents(): Promise<AppEvent[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return events as AppEvent[];
  }

  // ✅ Tạo một sự kiện mới
  async createEvent(event: Omit<AppEvent, 'id' | 'created_at'>): Promise<AppEvent> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ✅ Upload ảnh sự kiện (tùy chọn)
  async uploadEventImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase
      .storage
      .from('event-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase
      .storage
      .from('event-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  // ✅ Xoá sự kiện (theo id)
  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }
  // ✅ Cập nhật sự kiện theo ID
  async updateEvent(eventId: string, updatedFields: Partial<AppEvent>): Promise<AppEvent> {
    const { data, error } = await supabase
      .from('events')
      .update(updatedFields)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  // ✅ Tham gia sự kiện
  async joinEvent(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase.from('event_participants').insert({
      user_id: userId,
      event_id: eventId,
      registered_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

// ✅ Hủy tham gia sự kiện
  async leaveEvent(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ user_id: userId, event_id: eventId });

    if (error) throw error;
  }

// ✅ Kiểm tra người dùng đã tham gia sự kiện chưa
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
        onUpdate(); // reload danh sách sự kiện
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

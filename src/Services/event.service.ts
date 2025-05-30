import { Injectable } from '@angular/core';
import {supabase} from '../app/supabase.client';
import { AppEvent } from '../Models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  async getAllEvents(): Promise<AppEvent[]> {
    const { data: events, error } = await supabase
      .from('events')
      .select('*');

    if (error) {
      console.error('❌ Lỗi khi lấy danh sách sự kiện:', error);
      return [];
    }

    return await Promise.all(events.map(async (event: any) => {
      const { count, error: countError } = await supabase
        .from('event_participants')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id);

      if (countError) {
        console.error(`❌ Lỗi khi đếm participants của event ${event.id}:`, countError);
      }

      return {
        ...event,
        current_participants: count || 0
      } as AppEvent;
    }));
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
}

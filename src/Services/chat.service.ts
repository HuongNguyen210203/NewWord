import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { ChatRoom } from '../Models/chat-room.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor() {}

  async uploadRoomImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('room-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async createRoom(room: { name: string; description?: string; imageFile?: File }): Promise<ChatRoom> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (sessionError || !user) throw new Error('Chưa đăng nhập');

    let imageUrl = '';
    if (room.imageFile) {
      imageUrl = await this.uploadRoomImage(room.imageFile);
    }

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: room.name,
        description: room.description || '',
        image_url: imageUrl,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAllRooms(): Promise<ChatRoom[]> {
    const { data: rooms, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    if (roomError) throw roomError;

    const { data: participants, error: participantError } = await supabase
      .from('room_participants')
      .select('room_id');
    if (participantError) throw participantError;

    const countMap = new Map<string, number>();
    participants?.forEach(p => {
      const roomId = p.room_id;
      countMap.set(roomId, (countMap.get(roomId) || 0) + 1);
    });

    return (rooms || []).map(room => ({
      ...room,
      members: countMap.get(room.id) || 0
    }));
  }

  async updateRoom(
    id: string,
    updates: { name?: string; description?: string; image_url?: string; members?: number }
  ) {
    const { error } = await supabase.from('chat_rooms').update(updates).eq('id', id);
    if (error) throw error;
  }

  async deleteRoom(id: string) {
    const { error } = await supabase.from('chat_rooms').delete().eq('id', id);
    if (error) throw error;
  }
}

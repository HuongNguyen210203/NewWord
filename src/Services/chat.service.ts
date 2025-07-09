import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { ChatRoom } from '../Models/chat-room.model';
import { Message } from '../Models/message.model';
import { RealtimeChannel } from '@supabase/supabase-js';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private roomChannel?: RealtimeChannel;

  constructor(private notificationService: NotificationService) {}

  // ======== FILE UPLOAD LOGIC ========
  async uploadFile(file: File, userId: string): Promise<string> {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm'];
    const fileType = file.type;
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!validImageTypes.includes(fileType) && !validVideoTypes.includes(fileType)) {
      throw new Error('Chỉ hỗ trợ ảnh (JPG, PNG, GIF) hoặc video (MP4, WebM).');
    }

    // Generate a unique file name in the public folder
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from('chat-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Lỗi khi tải file lên: ${error.message}`);
    }

    // Get the public URL of the uploaded file
    const { data } = supabase.storage.from('chat-uploads').getPublicUrl(filePath);
    return data.publicUrl;
  }

  // ======== ROOM LOGIC ========
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
      image: room.image_url,
      createdAt: room.created_at,
      members: countMap.get(room.id) || 0,
    }));
  }

  async createRoom(room: { name: string; description?: string; imageFile?: File }): Promise<ChatRoom> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (sessionError || !user) throw new Error('Not logged in');

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
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRoom(id: string, updates: { name?: string; description?: string; image_url?: string; is_hidden?: boolean }) {
    const { data: originalRoom } = await supabase
      .from('chat_rooms')
      .select('name, is_hidden')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('chat_rooms').update(updates).eq('id', id);
    if (error) throw error;

    const { data: participants } = await supabase
      .from('room_participants')
      .select('user_id')
      .eq('room_id', id);

    const participantIds = participants?.map(p => p.user_id) || [];

    if (updates.is_hidden === true && originalRoom?.is_hidden === false) {
      await this.notificationService.notifyParticipants(participantIds, {
        type: 'room',
        action: 'locked',
        target_id: id,
        title: 'Room Locked',
        message: `Room <b>${originalRoom?.name}</b> has been locked.`,
      });
    } else if (updates.is_hidden === false && originalRoom?.is_hidden === true) {
      await this.notificationService.notifyParticipants(participantIds, {
        type: 'room',
        action: 'unlocked',
        target_id: id,
        title: 'Room Reopened',
        message: `Room <b>${originalRoom?.name}</b> has been reopened.`,
      });
    } else if (originalRoom?.is_hidden === false || originalRoom?.is_hidden === undefined) {
      await this.notificationService.notifyParticipants(participantIds, {
        type: 'room',
        action: 'updated',
        target_id: id,
        title: 'Room Updated',
        message: `Room <b>${originalRoom?.name}</b> has been updated.`,
      });
    }
  }

  async deleteRoom(id: string) {
    await supabase.from('room_participants').delete().eq('room_id', id);
    await supabase.from('chat_rooms').delete().eq('id', id);
  }

  async uploadRoomImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('room-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  // ======== PARTICIPANT LOGIC ========
  async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    return !!data && !error;
  }

  async joinRoom(roomId: string, userId: string): Promise<boolean> {
    await supabase.from('room_participants').delete().match({ room_id: roomId, user_id: userId });

    const { error: insertError } = await supabase.from('room_participants').insert({
      room_id: roomId,
      user_id: userId,
      joined_at: new Date().toISOString(),
    });

    if (insertError) return false;

    const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
    const { data: room } = await supabase.from('chat_rooms').select('name').eq('id', roomId).maybeSingle();

    await this.notificationService.notifyAllAdmins({
      type: 'room',
      action: 'joined',
      target_id: roomId,
      title: 'User Joined Room',
      message: `<b>${user?.email}</b> has joined room <b>${room?.name}</b>.`,
    });

    return true;
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await supabase.from('room_participants').delete().match({ room_id: roomId, user_id: userId });

    const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
    const { data: room } = await supabase.from('chat_rooms').select('name').eq('id', roomId).maybeSingle();

    await this.notificationService.notifyAllAdmins({
      type: 'room',
      action: 'left',
      target_id: roomId,
      title: 'User Left Room',
      message: `<b>${user?.email}</b> has left room <b>${room?.name}</b>.`,
    });
  }

  // ======== MESSAGE LOGIC ========
  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, users!messages_sender_id_fkey (name, avatar_url)')
      .eq('room_id', roomId)
      .order('sent_at', { ascending: true });

    if (error) return [];
    return data as Message[];
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ): Promise<boolean> {
    const { error } = await supabase.from('messages').insert([
      {
        room_id: roomId,
        sender_id: userId,
        content,
        media_url: mediaUrl,
        media_type: mediaType || 'text',
        sent_at: new Date().toISOString(),
      },
    ]);
    return !error;
  }
}

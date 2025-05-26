import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { ChatRoom } from '../Models/chat-room.model';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  async getAllRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*');

    if (error) {
      console.error('❌ Error loading chat rooms:', error.message);
      return [];
    }

    return data as ChatRoom[];
  }

  async getTotalMessages(): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error counting messages:', error.message);
      return 0;
    }

    return count ?? 0;
  }

  /**
   * Giả lập logic: Tìm các tin nhắn cần phản hồi (VD: không được trả lời)
   */
  async getMessagesNeedingReply(): Promise<number> {
    const { data, error } = await supabase
      .from('messages')
      .select('*');

    if (error) {
      console.error('❌ Error loading messages:', error.message);
      return 0;
    }

    // Ví dụ đơn giản: tin nhắn chưa có từ khoá "replied"
    const needReply = data.filter((m: any) => !m.content?.toLowerCase().includes('replied'));
    return needReply.length;
  }
}

import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { ChatRoom } from '../Models/chat-room.model';

@Injectable({ providedIn: 'root' })
export class ChatService {

  constructor() {}

  /**
   * Upload ảnh đại diện phòng chat lên Supabase Storage (bucket: room-images)
   * @param file ảnh từ máy người dùng
   * @returns URL công khai sau khi upload
   */
  async uploadRoomImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`; // đặt tên file theo timestamp

    const { data, error } = await supabase
      .storage
      .from('room-images')
      .upload(fileName, file); // upload ảnh

    if (error) throw error;

    const { data: publicUrl } = supabase
      .storage
      .from('room-images')
      .getPublicUrl(fileName); // lấy URL công khai

    return publicUrl.publicUrl;
  }

  /**
   * Tạo phòng chat mới (tùy chọn có ảnh)
   * @param room gồm name, description, và imageFile
   * @returns dữ liệu phòng vừa tạo
   */
  async createRoom(room: { name: string; description?: string; imageFile?: File }): Promise<ChatRoom> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) throw new Error('Chưa đăng nhập');

    let imageUrl = '';
    if (room.imageFile) {
      imageUrl = await this.uploadRoomImage(room.imageFile);
    }

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: room.name,
        description: room.description || '',
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  /**
   * Lấy tất cả phòng chat (sắp xếp mới nhất trước)
   * @returns mảng ChatRoom[]
   */
  async getAllRooms(): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Cập nhật tên và mô tả của một phòng
   * @param id ID phòng cần cập nhật
   * @param updates các trường cần sửa
   */
  async updateRoom(id: string, updates: { name?: string; description?: string }) {
    const { error } = await supabase
      .from('chat_rooms')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Xóa phòng chat khỏi hệ thống
   * @param id ID phòng cần xóa
   */
  async deleteRoom(id: string) {
    const { error } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

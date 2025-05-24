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
    // 1. Kiểm tra phiên đăng nhập
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) throw new Error('Chưa đăng nhập');

    // 2. Upload ảnh nếu có
    let imageUrl = '';
    if (room.imageFile) {
      try {
        imageUrl = await this.uploadRoomImage(room.imageFile);
      } catch (uploadError) {
        console.error('Lỗi khi upload ảnh:', uploadError);
        throw new Error('Không thể upload ảnh phòng');
      }
    }

    // 3. Tạo phòng
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

    if (error) {
      console.error('Lỗi khi tạo phòng:', error);
      throw new Error('Không thể tạo phòng. Vui lòng thử lại.');
    }

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

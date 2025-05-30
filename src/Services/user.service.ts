import { Injectable } from '@angular/core';
import { supabase } from '../app/supabase.client';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  async getAllUsers(): Promise<User[]> {
    const {data: users, error} = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, birth, is_hidden');

    if (error) {
      console.error('❌ Lỗi khi truy vấn bảng users:', error);
      return [];
    }

    const filteredUsers = users.filter((u: any) => u.role !== 'admin');

    const {data: roomParticipants} = await supabase
      .from('room_participants')
      .select('user_id');

    const {data: eventParticipants} = await supabase
      .from('event_participants')
      .select('user_id');

    return filteredUsers.map(user => {
      const joinedRooms = roomParticipants?.filter(r => r.user_id === user.id).length || 0;
      const events = eventParticipants?.filter(e => e.user_id === user.id).length || 0;

      return {
        ...user,
        joinedRooms,
        events
      } as User;
    });
  }

  async updateVisibility(id: string, is_hidden: boolean): Promise<void> {
    const {error} = await supabase
      .from('users')
      .update({is_hidden})
      .eq('id', id);

    if (error) {
      console.error('❌ Lỗi khi cập nhật is_hidden:', error.message);
      throw error;
    }
  }

  async updateUser(user: User): Promise<void> {
    // Lấy thông tin người dùng hiện tại từ Supabase Auth
    const {data: {user: authUser}, error: authError} = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ Lỗi khi lấy auth user:', authError.message);
      return;
    }
    const {error} = await supabase
      .from('users')
      .update({
        name: user.name,
        birth: user.birth,
        avatar_url: user.avatar_url
      })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Lỗi khi cập nhật người dùng:', error.message);
      throw error;
    }
  }
}


import {Injectable} from '@angular/core';
import {supabase} from '../app/supabase.client';
import {User} from '../Models/user.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  async getAllUsers(): Promise<User[]> {
    // 1. Lấy danh sách người dùng
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');
    if (userError) throw userError;

    // 2. Lấy room participants
    const { data: roomData, error: roomError } = await supabase
      .from('room_participants')
      .select('*');  // CHÚ Ý: dùng '*' thay vì 'user_id'
    if (roomError) throw roomError;

// 3. Lấy event participants
    const { data: eventData, error: eventError } = await supabase
      .from('event_participants')
      .select('*');  // CHÚ Ý: dùng '*' thay vì 'user_id'
    if (eventError) throw eventError;

    // 4. Tạo map đếm số lần tham gia
    const roomMap = new Map<string, number>();
    roomData?.forEach((p: any) => {
      const uid = String(p.user_id).trim();  // Ép và chuẩn hoá chuỗi
      roomMap.set(uid, (roomMap.get(uid) || 0) + 1);
    });

    const eventMap = new Map<string, number>();
    eventData?.forEach((p: any) => {
      const uid = String(p.user_id).trim();
      eventMap.set(uid, (eventMap.get(uid) || 0) + 1);
    });

    // 5. Ánh xạ dữ liệu đã enriched
    return (users || []).map(user => {
      const uid = String(user.id).trim();
      return {
        ...user,
        joinedRooms: roomMap.get(uid) || 0,
        events: eventMap.get(uid) || 0,
      };
    });
  }

  async updateVisibility(id: string, is_hidden: boolean): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_hidden })
      .eq('id', id);

    if (error) {
      console.error('❌ Lỗi khi cập nhật is_hidden:', error.message);
      throw error;
    }
  }

  private avatarUrlSubject = new BehaviorSubject<string>('https://via.placeholder.com/40');
  avatarUrl$ = this.avatarUrlSubject.asObservable();

  setAvatarUrl(url: string) {
    this.avatarUrlSubject.next(url);
  }

  async updateUser(user: User): Promise<void> {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Lỗi khi lấy auth user:', authError.message);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: user.name,
        birth: user.birth,
        avatar_url: user.avatar_url
      })
      .eq('id', user.id);

    if (user.avatar_url) {
      this.setAvatarUrl(user.avatar_url);
    }

    if (error) {
      console.error('❌ Lỗi khi cập nhật người dùng:', error.message);
      throw error;
    }
  }
}

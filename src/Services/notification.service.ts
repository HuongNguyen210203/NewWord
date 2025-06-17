import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../Models/notification.model';
import { supabase } from '../app/supabase.client';

export type NotificationAction = 'updated' | 'locked' | 'unlocked' | 'joined' | 'full' | 'left' | 'registered';
export type NotificationType = 'event' | 'room' | 'admin';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private hasUnreadSubject = new BehaviorSubject<boolean>(false);
  hasUnread$ = this.hasUnreadSubject.asObservable();

  private userId: string = '';
  private role: string = '';

  constructor() {
    this.init();
  }

  private async init() {
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData?.user) return;

    this.userId = authData.user.id;

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', this.userId)
      .maybeSingle();

    this.role = userData?.role || 'user';

    await this.fetchNotifications();
    this.listenToRealtime();
  }

  async fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const enriched = await Promise.all(data.map(this.enrichNotification));
      this.notificationsSubject.next(enriched);
      this.hasUnreadSubject.next(enriched.some(n => !n.seen));
    }
  }

  private async enrichNotification(n: Notification): Promise<Notification & { target_name: string, target_image: string }> {
    let targetName = '';
    let imageUrl = '';

    if (n.type === 'room') {
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('name, image_url')
        .eq('id', n.target_id)
        .maybeSingle();
      targetName = room?.name || '';
      imageUrl = room?.image_url || '';
    } else if (n.type === 'event') {
      const { data: event } = await supabase
        .from('events')
        .select('title, image_url')
        .eq('id', n.target_id)
        .maybeSingle();
      targetName = event?.title || '';
      imageUrl = event?.image_url || '';
    }

    return {
      ...n,
      target_name: targetName,
      target_image: imageUrl,
    };
  }

  private listenToRealtime() {
    supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`,
        },
        async (payload) => {
          const newNoti = payload.new as Notification;
          const enriched = await this.enrichNotification(newNoti);
          const current = this.notificationsSubject.getValue();
          this.notificationsSubject.next([enriched, ...current]);
          const updated = [enriched, ...current];
          this.hasUnreadSubject.next(updated.some(n => !n.seen));
        }
      )
      .subscribe();
  }

  async markAllAsRead() {
    const unseen = this.notificationsSubject.getValue().filter(n => !n.seen);
    if (unseen.length === 0) return;

    await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('user_id', this.userId)
      .eq('seen', false);

    await this.fetchNotifications();
  }

  async createNotification(noti: Partial<Notification>) {
    return await supabase.from('notifications').insert(noti);
  }

  async notifyAllAdmins(payload: {
    type: NotificationType;
    action: NotificationAction;
    target_id: string;
    title: string;
    message: string;
  }) {
    console.log('✅ Sending notification to admins:', payload);
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (!admins) return;

    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      ...payload,
      seen: false,
    }));

    console.log('📤 Payload to insert (admins):', notifications);
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) console.error('❌ Failed to insert notifications:', error);
  }

  async notifyParticipants(
    participantIds: string[],
    payload: {
      type: NotificationType;
      action: NotificationAction;
      target_id: string;
      title: string;
      message: string;
    }
  ) {
    const notifications = participantIds.map((id) => ({
      user_id: id,
      ...payload,
      seen: false,
    }));

    console.log('📤 Payload to insert (participants):', notifications);
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) console.error('❌ Failed to notify participants:', error);
  }

  getRole(): string {
    return this.role;
  }
}

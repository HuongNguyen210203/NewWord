export interface Notification {
  id: string;
  user_id: string;
  type: 'event' | 'room' | 'admin';
  action: 'updated' | 'locked' | 'unlocked' | 'joined' | 'full' | 'registered' | 'left';
  target_id: string;
  title: string;
  message: string;
  seen: boolean;
  created_at: string;
  target_name?: string;
  target_image?: string;
}

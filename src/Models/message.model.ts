export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  media_type?: string;
  media_url?: string;
  sent_at: string;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

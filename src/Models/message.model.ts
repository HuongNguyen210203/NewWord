export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  media_type?: string;   // "text" | "image" | "video" | "file"
  media_url?: string;
  sent_at: string;       // ISO string (UTC)

  // Optional: nếu join user để lấy tên/ảnh
  sender?: {
    name: string;
    avatar_url?: string;
  };
}

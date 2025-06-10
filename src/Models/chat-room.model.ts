export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at?: string;
  image_url?: string;
  active_members?: number;
  members?: number;
  is_hidden: boolean;
}

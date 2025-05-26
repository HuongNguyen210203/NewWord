export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  birth?: string;
  role: string;
  is_hidden: boolean;
  joinedRooms: number;
  events: number;
}

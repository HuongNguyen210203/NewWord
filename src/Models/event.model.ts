export interface AppEvent {
  id: string;
  title: string;
  description: string;
  start_time: string; // ISO string
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  location: string;
  image_url?: string;
  created_by: string;
  created_at?: string;
}

import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
{
  auth: {
    storage: sessionStorage // ✅ mỗi tab dùng riêng, tránh xung đột
  }
}
);

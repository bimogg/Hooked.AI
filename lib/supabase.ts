import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(url, key);
export const supabaseAdmin = createClient(url, serviceKey ?? key);

export type Hook = {
  id: string;
  instagram_id: string;
  creator_username: string;
  video_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  views: number;
  likes: number;
  comments: number;
  niche: string;
  created_at: string;
};

export type UserReel = {
  id: string;
  reel_id: string;
  title: string | null;
  thumbnail_url: string | null;
  views: number;
  avg_watch_time: number | null;
  completion_rate: number | null;
  retention_data: { second: number; viewers: number }[] | null;
  drop_points: { second: number; drop_pct: number }[] | null;
  recommendations: string[] | null;
  analyzed_at: string | null;
};

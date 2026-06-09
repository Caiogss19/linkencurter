import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Supabase env vars ausentes: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export type ShortLink = {
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
  created_by: string | null;
};

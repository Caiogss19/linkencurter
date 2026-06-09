import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

function build(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase env vars ausentes: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export function getSupabase(): SupabaseClient {
  if (!cached) cached = build();
  return cached;
}

export type ShortLink = {
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
  created_by: string | null;
};

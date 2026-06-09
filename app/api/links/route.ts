import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildBaseUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const { data, error } = await getSupabase()
    .from('short_links')
    .select('slug, url, clicks, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = buildBaseUrl(req);
  const links = (data ?? []).map((row) => ({
    ...row,
    shortUrl: `${baseUrl}/${row.slug}`,
  }));

  return NextResponse.json({ links });
}

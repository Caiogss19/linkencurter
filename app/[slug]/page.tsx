import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { SLUG_REGEX } from '@/lib/slug';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function SlugRedirect({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  if (!SLUG_REGEX.test(slug)) notFound();

  const sb = getSupabase();
  const { data, error } = await sb
    .from('short_links')
    .select('url')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) notFound();

  await sb.rpc('increment_short_link_clicks', { p_slug: slug });

  redirect(data.url);
}

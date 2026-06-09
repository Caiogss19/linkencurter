import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

  const { data, error } = await supabase
    .from('short_links')
    .select('url')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) notFound();

  await supabase.rpc('increment_short_link_clicks', { p_slug: slug });

  redirect(data.url);
}

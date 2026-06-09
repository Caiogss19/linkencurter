import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug, isReservedSlug, isValidUrl, SLUG_REGEX } from '@/lib/slug';
import { isAuthenticated } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildBaseUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  let body: { url?: unknown; slug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const url = body.url;
  if (!isValidUrl(url)) {
    return NextResponse.json(
      { error: 'URL inválida. Use http:// ou https://' },
      { status: 400 },
    );
  }

  let slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (slug) {
    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        { error: 'Slug inválido. Use 3-32 caracteres (letras, números, _ ou -)' },
        { status: 400 },
      );
    }
    if (isReservedSlug(slug)) {
      return NextResponse.json({ error: 'Esse slug é reservado' }, { status: 400 });
    }
    const { data: existing } = await supabase
      .from('short_links')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'Esse slug já está em uso' }, { status: 409 });
    }
  } else {
    let attempts = 0;
    while (attempts < 5) {
      const candidate = generateSlug();
      const { data: existing } = await supabase
        .from('short_links')
        .select('slug')
        .eq('slug', candidate)
        .maybeSingle();
      if (!existing) {
        slug = candidate;
        break;
      }
      attempts++;
    }
    if (!slug) {
      return NextResponse.json({ error: 'Não foi possível gerar slug, tente novamente' }, { status: 500 });
    }
  }

  const { error } = await supabase
    .from('short_links')
    .insert({ slug, url, created_by: null });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = buildBaseUrl(req);
  return NextResponse.json({
    slug,
    url,
    clicks: 0,
    created_at: new Date().toISOString(),
    shortUrl: `${baseUrl}/${slug}`,
  });
}

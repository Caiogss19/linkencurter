# Spark Maxx · Link Shortener

Encurtador de links interno da Spark Maxx. Feito pra mandar URLs curtas no WhatsApp e redes sociais sem depender de bit.ly e cia.

Stack: **Next.js 14 (App Router) + Supabase (Postgres) + Vercel**.

## Como funciona

- `/` — dashboard pra criar e listar links (aberto, sem login)
- `/:slug` — redirect público com contagem de cliques
- Storage: tabela `public.short_links` no projeto Supabase `spark-maxx-rd-dashboard`

## Setup no Vercel

1. **Importar o repo** no painel Vercel (time `caiogss1909-3571's projects`).
2. **Configurar env vars** (Settings → Environment Variables):

   | Variável                       | Valor                                                                                |
   | ------------------------------ | ------------------------------------------------------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`     | `https://rximtawdguljuwiektgx.supabase.co`                                            |
   | `SUPABASE_SERVICE_ROLE_KEY`    | Pegar no painel Supabase → Settings → API → `service_role` key                       |
   | `NEXT_PUBLIC_BASE_URL`         | URL pública do app, ex: `https://spark-link.vercel.app` (opcional, detecta sozinho)   |

3. **Deploy**. Vercel pega `next.config.mjs` e `vercel.json` (região `gru1` São Paulo) automaticamente.

> ⚠️ A `service_role` key bypassa RLS — nunca colar no front. Só vai em var de servidor.

## Rodar local

```bash
cp .env.example .env.local
# preencha .env.local com os valores acima
npm install
npm run dev
```

Abra `http://localhost:3000` → cai direto no dashboard.

## Banco de dados

A migration já foi aplicada no Supabase `spark-maxx-rd-dashboard`. Schema:

```sql
CREATE TABLE public.short_links (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  clicks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE FUNCTION public.increment_short_link_clicks(p_slug TEXT) ...;
```

RLS habilitada sem policies — apenas o backend (service role) acessa.

## Estrutura

```
app/
  api/
    shorten/route.ts    POST: cria link curto
    links/route.ts      GET: lista 50 últimos
  [slug]/page.tsx       redirect público + clicks++
  dashboard.tsx         UI cliente do painel
  page.tsx              entrypoint
  not-found.tsx         404 customizado
lib/
  supabase.ts           cliente Supabase com service role
  slug.ts               regex e geração nanoid
vercel.json             região gru1
```

## Domínio próprio

Quando tiver um domínio (ex: `lnk.sparkmaxx.com.br`):

1. Vercel → Project → Settings → Domains → adicionar
2. Apontar CNAME no DNS pro Vercel
3. Definir env `NEXT_PUBLIC_BASE_URL=https://lnk.sparkmaxx.com.br`
4. Redeploy

'use client';

import { useEffect, useState, type FormEvent } from 'react';

type ShortLink = {
  slug: string;
  url: string;
  clicks: number;
  created_at: string;
  shortUrl: string;
};

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortLink | null>(null);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function loadLinks() {
    setLoadingLinks(true);
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      // ignore — UI shows empty
    } finally {
      setLoadingLinks(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), slug: slug.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível encurtar.');
        return;
      }
      setResult(data);
      setUrl('');
      setSlug('');
      loadLinks();
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Link copiado!');
    } catch {
      showToast('Não foi possível copiar.');
    }
  }

  function shareWhatsapp(shortUrl: string) {
    const text = encodeURIComponent(shortUrl);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
  }

  return (
    <div className="page">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div className="brand-name">
          <strong>Spark Maxx</strong>
          <span>Link Shortener</span>
        </div>
        <div className="brand-spacer" />
        <a className="btn-link" href="/api/logout">Sair</a>
      </div>

      <h1>Encurte um link</h1>
      <p className="subtitle">Cole a URL longa, escolha um slug se quiser, e compartilhe no WhatsApp ou onde precisar.</p>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="url">Link original</label>
          <input
            id="url"
            type="url"
            placeholder="https://sparkmaxx.com.br/uma/url/longa"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            autoComplete="off"
          />

          <label htmlFor="slug">Slug personalizado <span className="hint">(opcional, 3-32 chars)</span></label>
          <input
            id="slug"
            type="text"
            placeholder="promo-julho"
            pattern="[A-Za-z0-9_\-]{3,32}"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            autoComplete="off"
          />

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'Encurtando…' : 'Encurtar'}
          </button>

          {error ? <p className="error">{error}</p> : null}

          {result ? (
            <div className="result">
              <p className="result-label">Seu link curto</p>
              <div className="result-row">
                <a className="short-link" href={result.shortUrl} target="_blank" rel="noopener">
                  {result.shortUrl}
                </a>
                <button className="ghost" type="button" onClick={() => copy(result.shortUrl)}>
                  Copiar
                </button>
                <button className="ghost" type="button" onClick={() => shareWhatsapp(result.shortUrl)}>
                  WhatsApp
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Links recentes</h2>
          <button className="ghost" type="button" onClick={loadLinks} disabled={loadingLinks}>
            {loadingLinks ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>

        {links.length === 0 ? (
          <p className="empty">Nenhum link ainda. Crie o primeiro aí em cima!</p>
        ) : (
          <ul className="links-list">
            {links.map((link) => (
              <li key={link.slug}>
                <a className="short" href={link.shortUrl} target="_blank" rel="noopener">
                  {link.shortUrl}
                </a>
                <span className="original">{link.url}</span>
                <div className="meta">
                  <span className="badge">{link.clicks} clique{link.clicks === 1 ? '' : 's'}</span>
                  <span>{new Date(link.created_at).toLocaleString('pt-BR')}</span>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => copy(link.shortUrl)}
                    style={{ marginLeft: 'auto' }}
                  >
                    Copiar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <p>Spark Maxx · Encurtador interno</p>
      </footer>

      {toast ? <div className="toast show">{toast}</div> : null}
    </div>
  );
}

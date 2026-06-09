const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url');
const slugInput = document.getElementById('slug');
const submitBtn = document.getElementById('submit-btn');
const resultEl = document.getElementById('result');
const shortLinkEl = document.getElementById('short-link');
const copyBtn = document.getElementById('copy-btn');
const errorEl = document.getElementById('error');
const linksListEl = document.getElementById('links-list');
const emptyStateEl = document.getElementById('empty-state');
const refreshBtn = document.getElementById('refresh-btn');

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
}

function hideError() {
  errorEl.classList.add('hidden');
  errorEl.textContent = '';
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

async function loadLinks() {
  try {
    const res = await fetch('/api/links');
    const data = await res.json();
    renderLinks(data.links || []);
  } catch (err) {
    console.error('Erro ao carregar links', err);
  }
}

function renderLinks(links) {
  linksListEl.innerHTML = '';
  if (!links.length) {
    emptyStateEl.classList.remove('hidden');
    return;
  }
  emptyStateEl.classList.add('hidden');

  for (const link of links) {
    const li = document.createElement('li');

    const short = document.createElement('a');
    short.className = 'short';
    short.href = link.shortUrl;
    short.target = '_blank';
    short.rel = 'noopener';
    short.textContent = link.shortUrl;

    const original = document.createElement('span');
    original.className = 'original';
    original.textContent = link.url;

    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${link.clicks} clique${link.clicks === 1 ? '' : 's'} · ${formatDate(link.created_at)}`;

    li.append(short, original, meta);
    linksListEl.appendChild(li);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const url = urlInput.value.trim();
  const slug = slugInput.value.trim();
  if (!url) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Encurtando...';

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, slug: slug || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Não foi possível encurtar o link');
      return;
    }

    shortLinkEl.href = data.shortUrl;
    shortLinkEl.textContent = data.shortUrl;
    resultEl.classList.remove('hidden');
    urlInput.value = '';
    slugInput.value = '';
    loadLinks();
  } catch (err) {
    showError('Erro de rede. Tente novamente.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Encurtar';
  }
});

copyBtn.addEventListener('click', async () => {
  const url = shortLinkEl.textContent;
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copiado!');
  } catch {
    const range = document.createRange();
    range.selectNode(shortLinkEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    showToast('Selecionado — Ctrl+C para copiar');
  }
});

refreshBtn.addEventListener('click', loadLinks);

loadLinks();

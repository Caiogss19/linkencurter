const express = require('express');
const path = require('path');
const { customAlphabet } = require('nanoid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const generateSlug = customAlphabet('123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ', 6);
const SLUG_REGEX = /^[A-Za-z0-9_-]{3,32}$/;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const insertLink = db.prepare('INSERT INTO links (slug, url, clicks, created_at) VALUES (?, ?, 0, ?)');
const findBySlug = db.prepare('SELECT slug, url, clicks, created_at FROM links WHERE slug = ?');
const incrementClicks = db.prepare('UPDATE links SET clicks = clicks + 1 WHERE slug = ?');
const listLinks = db.prepare('SELECT slug, url, clicks, created_at FROM links ORDER BY created_at DESC LIMIT 50');

function isValidUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

app.post('/api/shorten', (req, res) => {
  const { url, slug: customSlug } = req.body || {};

  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({ error: 'URL inválida. Use http:// ou https://' });
  }

  let slug = customSlug?.trim();
  if (slug) {
    if (!SLUG_REGEX.test(slug)) {
      return res.status(400).json({ error: 'Slug inválido. Use 3-32 caracteres (letras, números, _ ou -)' });
    }
    if (findBySlug.get(slug)) {
      return res.status(409).json({ error: 'Esse slug já está em uso' });
    }
  } else {
    let attempts = 0;
    do {
      slug = generateSlug();
      attempts++;
    } while (findBySlug.get(slug) && attempts < 5);
  }

  insertLink.run(slug, url, Date.now());

  res.json({
    slug,
    url,
    shortUrl: `${BASE_URL}/${slug}`,
  });
});

app.get('/api/links', (_req, res) => {
  const rows = listLinks.all().map((row) => ({
    ...row,
    shortUrl: `${BASE_URL}/${row.slug}`,
  }));
  res.json({ links: rows });
});

app.get('/:slug', (req, res, next) => {
  const { slug } = req.params;
  if (!SLUG_REGEX.test(slug)) return next();

  const link = findBySlug.get(slug);
  if (!link) return next();

  incrementClicks.run(slug);
  res.redirect(302, link.url);
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Linkencurter rodando em ${BASE_URL}`);
});

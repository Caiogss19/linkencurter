# 🔗 Linkencurter

Encurtador de links simples e auto-hospedado, feito para usar no WhatsApp e redes sociais.

## Recursos

- Encurtar qualquer URL `http://` ou `https://`
- Slugs personalizados (ex: `meusite.com/promo`)
- Contagem de cliques
- Lista dos links recentes
- Interface limpa, responsiva e em português
- Armazenamento local com SQLite (zero configuração)

## Como rodar localmente

Precisa de Node.js 18+.

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

| Variável   | Padrão                  | Descrição                                              |
| ---------- | ----------------------- | ------------------------------------------------------ |
| `PORT`     | `3000`                  | Porta do servidor                                      |
| `BASE_URL` | `http://localhost:PORT` | Domínio público (ex: `https://meu.link`)               |
| `DATA_DIR` | `./data`                | Pasta onde o banco SQLite é salvo                      |

## Deploy

Funciona em qualquer serviço que rode Node.js com armazenamento persistente:

- **Railway / Render / Fly.io**: aponte o repo, defina `BASE_URL` e suba.
- **VPS**: rode com `pm2` ou `systemd`.

Como usa SQLite com WAL, recomenda-se um volume persistente para `DATA_DIR` em hospedagens.

## API

### `POST /api/shorten`

```json
{ "url": "https://exemplo.com", "slug": "opcional" }
```

Resposta:

```json
{ "slug": "abc123", "url": "https://exemplo.com", "shortUrl": "http://localhost:3000/abc123" }
```

### `GET /api/links`

Lista os últimos 50 links criados.

### `GET /:slug`

Redireciona para a URL original e incrementa o contador de cliques.

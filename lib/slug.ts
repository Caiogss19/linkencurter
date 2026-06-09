import { customAlphabet } from 'nanoid';

const ALPHABET = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export const generateSlug = customAlphabet(ALPHABET, 6);

export const SLUG_REGEX = /^[A-Za-z0-9_-]{3,32}$/;

const RESERVED_SLUGS = new Set(['api', 'login', 'logout', 'admin', '_next', 'favicon.ico', 'robots.txt']);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

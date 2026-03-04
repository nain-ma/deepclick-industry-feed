// src/http.mjs -- Shared HTTP utilities with SSRF protection + got-scraping transport
import { gotScraping } from 'got-scraping';
import { lookup } from 'dns/promises';
import { isIP } from 'net';

const PROXY_URL = process.env.HTTPS_PROXY || process.env.https_proxy ||
                  process.env.HTTP_PROXY || process.env.http_proxy || '';

const MAX_BODY_BYTES = 200_000;

export function isPrivateOrSpecialIp(ip) {
  if (!ip) return true;
  if (ip.includes(':')) {
    const n = ip.toLowerCase();
    return n === '::1' || n.startsWith('fc') || n.startsWith('fd') || n.startsWith('fe80:') || n.startsWith('::ffff:127.');
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((x) => Number.isNaN(x) || x < 0 || x > 255)) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

export async function assertSafeFetchUrl(rawUrl) {
  const u = new URL(rawUrl);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('invalid url scheme');
  const host = u.hostname;
  if (host === 'localhost' || host.endsWith('.localhost')) throw new Error('blocked host');
  if (isIP(host) && isPrivateOrSpecialIp(host)) throw new Error('blocked host');
  // Skip DNS check when using proxy (proxy resolves DNS)
  if (PROXY_URL) return;
  const resolved = await lookup(host, { all: true });
  if (!resolved.length || resolved.some((r) => isPrivateOrSpecialIp(r.address))) {
    throw new Error('blocked host');
  }
}

/**
 * Fetch a URL with SSRF protection, timeout, redirect following, proxy support, and size limit.
 * Transport: got-scraping (browser-like headers, HTTP/2, native proxy).
 * Set HTTPS_PROXY env var to route through an HTTP proxy (e.g. http://127.0.0.1:7890).
 *
 * @param {string} url
 * @param {number} timeout - Request timeout in ms (default 15000)
 * @param {number} redirectsLeft - Max redirects to follow (default 3)
 * @param {object} options - Extra options: { headers, useHeaderGenerator, maxBodyBytes }
 */
export async function httpFetch(url, timeout = 15000, redirectsLeft = 3, options = {}) {
  await assertSafeFetchUrl(url);

  const response = await gotScraping({
    url,
    timeout: { request: timeout },
    maxRedirects: redirectsLeft,
    followRedirect: true,
    proxyUrl: PROXY_URL || undefined,
    responseType: 'text',
    throwHttpErrors: false,
    useHeaderGenerator: options.useHeaderGenerator !== undefined ? options.useHeaderGenerator : true,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml,application/json,*/*',
      ...options.headers,
    },
  });

  let body = response.body;
  const maxBodyBytes = Number.isFinite(options.maxBodyBytes) ? options.maxBodyBytes : MAX_BODY_BYTES;
  if (maxBodyBytes > 0 && body.length > maxBodyBytes) {
    body = body.slice(0, maxBodyBytes);
  }

  return { contentType: response.headers['content-type'] || '', body };
}

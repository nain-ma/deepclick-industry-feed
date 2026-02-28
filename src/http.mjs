// src/http.mjs -- Shared HTTP utilities with SSRF protection
// Extracted from server.mjs to enable reuse by collector and fetcher modules
import http from 'http';
import https from 'https';
import { lookup } from 'dns/promises';
import { isIP } from 'net';

/**
 * Check if an IP address is private, reserved, or special-use.
 * Covers: loopback, link-local, private RFC 1918, multicast, IPv6 equivalents.
 */
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
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

/**
 * Validate that a URL is safe to fetch (not pointing to internal/private networks).
 * Checks protocol, hostname, and resolved IP addresses.
 *
 * KNOWN LIMITATION (TOCTOU): DNS is resolved here for validation, then again
 * by the HTTP client. A DNS rebinding attack could bypass this check.
 * Fix planned for Phase 2 with DNS-pinning HTTP agent.
 */
export async function assertSafeFetchUrl(rawUrl) {
  const u = new URL(rawUrl);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('invalid url scheme');
  const host = u.hostname;
  if (host === 'localhost' || host.endsWith('.localhost')) throw new Error('blocked host');
  if (isIP(host) && isPrivateOrSpecialIp(host)) throw new Error('blocked host');
  const resolved = await lookup(host, { all: true });
  if (!resolved.length || resolved.some((r) => isPrivateOrSpecialIp(r.address))) {
    throw new Error('blocked host');
  }
}

/**
 * Fetch a URL with SSRF protection, timeout, redirect following, and size limit.
 * Returns { contentType: string, body: string }.
 */
export async function httpFetch(url, timeout = 15000, redirectsLeft = 3) {
  await assertSafeFetchUrl(url);
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const r = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,application/xml,application/json,*/*' } }, async (resp) => {
      try {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          clearTimeout(timer);
          if (redirectsLeft <= 0) return reject(new Error('too many redirects'));
          const nextUrl = new URL(resp.headers.location, url).toString();
          return resolve(await httpFetch(nextUrl, Math.max(1000, timeout - 1000), redirectsLeft - 1));
        }
        let data = '';
        resp.on('data', c => { data += c; if (data.length > 200000) resp.destroy(); });
        resp.on('end', () => { clearTimeout(timer); resolve({ contentType: resp.headers['content-type'] || '', body: data }); });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
    const timer = setTimeout(() => { r.destroy(); reject(new Error('timeout')); }, timeout);
    r.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

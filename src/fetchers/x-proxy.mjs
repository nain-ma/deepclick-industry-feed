// src/fetchers/x-proxy.mjs -- X/Twitter via RSS proxy bridge (multi-proxy fallback)
import { fetchRss } from './rss.mjs';

function stripAt(handle='') { return String(handle).replace(/^@/, ''); }

function buildFeedUrl(proxyBase, source, config) {
  const base = String(proxyBase || '').replace(/\/$/, '');
  const handle = stripAt(config.handle || '');

  if (source.type === 'twitter_list' && config.list_url) {
    const match = String(config.list_url).match(/lists\/(\d+)/);
    const listId = match ? match[1] : null;
    if (!listId) throw new Error('Could not extract list ID from list_url');

    if (base.includes('twiiit.com')) {
      throw new Error('twiiit proxy does not support twitter_list route');
    }
    if (base.includes('rss-bridge.org')) {
      // Example: https://rss-bridge.org/bridge01/?action=display&bridge=Twitter&context=By+list&l=<id>&format=Atom
      return `${base}/?action=display&bridge=Twitter&context=By+list&l=${encodeURIComponent(listId)}&format=Atom`;
    }
    return `${base}/twitter/list/${listId}`;
  }

  if (!handle) throw new Error('X proxy requires handle in source config');

  if (base.includes('twiiit.com')) return `${base}/${handle}/rss`;
  if (base.includes('rss-bridge.org')) {
    return `${base}/?action=display&bridge=Twitter&context=By+username&u=${encodeURIComponent(handle)}&format=Atom`;
  }
  return `${base}/twitter/user/${handle}`;
}

/**
 * Fetch X/Twitter content via a configurable RSS proxy with fallbacks.
 * config keys:
 * - proxy_base: single proxy base URL
 * - proxy_candidates: array of proxy base URLs (tried in order)
 */
export async function fetchXProxy(source, httpFetch) {
  const config = JSON.parse(source.config || '{}');
  const candidates = [];

  if (Array.isArray(config.proxy_candidates)) {
    for (const p of config.proxy_candidates) if (p) candidates.push(p);
  }
  if (config.proxy_base) candidates.push(config.proxy_base);
  if (config.rsshub_url) candidates.push(config.rsshub_url);

  const defaults = [
    'https://rsshub.app',
    'https://twiiit.com',
    'https://rss-bridge.org/bridge01'
  ];

  for (const d of defaults) if (!candidates.includes(d)) candidates.push(d);

  let lastErr = null;
  for (const base of candidates) {
    try {
      const feedUrl = buildFeedUrl(base, source, config);
      const items = await fetchRss(
        { ...source, config: JSON.stringify({ url: feedUrl }) },
        httpFetch
      );
      if (items && items.length > 0) return items;
      lastErr = new Error(`empty feed from ${base}`);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('All X proxy candidates failed');
}

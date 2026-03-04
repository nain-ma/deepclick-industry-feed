// src/fetchers/x-proxy.mjs -- X/Twitter via RSS proxy bridge (multi-proxy fallback)
import { fetchRss } from './rss.mjs';

function stripAt(handle='') { return String(handle).replace(/^@/, ''); }
function isBridge(base='') { return /rss-bridge/i.test(base); }
function isNitterLike(base='') { return /nitter|xrss|xcancel/i.test(base); }

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
    if (isBridge(base)) {
      // Example: https://rss-bridge.org/bridge01/?action=display&bridge=Twitter&context=By+list&l=<id>&format=Atom
      const bridgeName = config.bridge_name || 'TwitterV2';
      return `${base}/?action=display&bridge=${encodeURIComponent(bridgeName)}&context=By+list&l=${encodeURIComponent(listId)}&format=Atom`;
    }
    if (isNitterLike(base)) return `${base}/i/lists/${listId}/rss`;
    return `${base}/twitter/list/${listId}`;
  }

  if (!handle) throw new Error('X proxy requires handle in source config');

  if (base.includes('twiiit.com')) return `${base}/${handle}/rss`;
  if (isBridge(base)) {
    const bridgeName = config.bridge_name || 'TwitterV2';
    return `${base}/?action=display&bridge=${encodeURIComponent(bridgeName)}&context=By+username&u=${encodeURIComponent(handle)}&format=Atom`;
  }
  if (isNitterLike(base)) return `${base}/${handle}/rss`;
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
  const envCandidates = (process.env.X_PROXY_CANDIDATES || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (Array.isArray(config.proxy_candidates)) {
    for (const p of config.proxy_candidates) if (p) candidates.push(p);
  }
  if (config.proxy_base) candidates.push(config.proxy_base);
  if (config.rsshub_url) candidates.push(config.rsshub_url);
  for (const candidate of envCandidates) candidates.push(candidate);

  const defaults = envCandidates.length > 0
    ? []
    : [
        'https://rsshub.app',
        'https://rss-bridge.org/bridge01',
        'https://twiiit.com'
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

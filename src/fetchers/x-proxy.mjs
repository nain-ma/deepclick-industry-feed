// src/fetchers/x-proxy.mjs -- X/Twitter via RSS proxy bridge
// Fetches tweets via a configurable third-party RSS proxy (e.g. RSSHub).
// Delegates RSS parsing to fetchRss from rss.mjs.
import { fetchRss } from './rss.mjs';

// ── Main export ──

/**
 * Fetch X/Twitter content via a configurable RSS proxy.
 * Supports twitter_feed (user timeline) and twitter_list (list) source types.
 * @param {object} source - Source row with .config JSON containing { proxy_base, handle?, list_url? }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchXProxy(source, httpFetch) {
  const config = JSON.parse(source.config);
  const proxyBase = (config.proxy_base || config.rsshub_url || '').replace(
    /\/$/,
    ''
  );

  if (!proxyBase) {
    throw new Error('X proxy requires proxy_base in source config');
  }

  let feedUrl;

  if (source.type === 'twitter_list' && config.list_url) {
    // Extract list ID from URL like https://twitter.com/i/lists/123456
    const match = config.list_url.match(/lists\/(\d+)/);
    const listId = match ? match[1] : null;
    if (!listId) {
      throw new Error('Could not extract list ID from list_url');
    }
    feedUrl = `${proxyBase}/twitter/list/${listId}`;
  } else {
    // Default: twitter_feed -- user timeline
    const handle = (config.handle || '').replace(/^@/, '');
    if (!handle) {
      throw new Error('X proxy requires handle in source config');
    }
    feedUrl = `${proxyBase}/twitter/user/${handle}`;
  }

  // Delegate to fetchRss with synthetic source
  return fetchRss(
    { ...source, config: JSON.stringify({ url: feedUrl }) },
    httpFetch
  );
}

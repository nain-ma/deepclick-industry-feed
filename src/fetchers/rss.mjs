// src/fetchers/rss.mjs -- RSS/Atom/JSON Feed fetcher
// Uses @extractus/feed-extractor for parse-only feed parsing.
import { createHash } from 'crypto';
import { extractFromXml, extractFromJson } from '@extractus/feed-extractor';

function safeDate(val) {
  if (val == null) return null;
  if (typeof val === 'number') {
    const ts = val < 1e12 ? val * 1000 : val;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

function dedupKey(url, title) {
  const input = url || title || String(Date.now());
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Fetch and parse an RSS/Atom/JSON feed from a source.
 * @param {object} source - Source row with .config JSON string containing { url }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function (from src/http.mjs)
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchRss(source, httpFetch) {
  const config = JSON.parse(source.config);
  const { body, contentType } = await httpFetch(config.url);

  let feed;
  // Detect JSON Feed
  if (
    (contentType && contentType.includes('json')) ||
    body.trimStart().startsWith('{')
  ) {
    try {
      feed = extractFromJson(body);
    } catch {
      // Fall through to XML parsing if JSON parse fails
    }
  }
  if (!feed) {
    feed = extractFromXml(body);
  }

  const entries = feed?.entries || [];
  return entries.map((entry) => ({
    title: entry.title || '',
    url: entry.link || '',
    author: '',
    content: entry.description || '',
    published_at: safeDate(entry.published),
    dedup_key: dedupKey(entry.link || '', entry.title || ''),
    metadata: '{}',
  }));
}

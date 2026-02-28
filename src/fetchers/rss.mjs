// src/fetchers/rss.mjs -- RSS/Atom/JSON Feed fetcher
// Parses RSS 2.0, Atom 1.0, RDF, and JSON Feed into NormalizedItem[]
import { createHash } from 'crypto';
import { XMLParser } from 'fast-xml-parser';

// ── Helpers (not exported) ──

/**
 * Extract text from various XML node representations.
 * Handles plain strings, #text nodes, CDATA sections.
 */
function extractText(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    if (val['#text'] != null) return String(val['#text']).trim();
    if (val.__cdata != null) return String(val.__cdata).trim();
  }
  return String(val).trim();
}

/**
 * Extract the best link URL from an item.
 * Handles: string link, @_href attribute, array of links with rel=alternate, GUID fallback.
 */
function extractLink(item) {
  const link = item.link;
  if (typeof link === 'string') return link.trim();
  if (link && typeof link === 'object') {
    // Atom link with href attribute
    if (link['@_href']) return link['@_href'];
    // Array of links -- prefer rel=alternate
    if (Array.isArray(link)) {
      const alt = link.find(
        (l) => l['@_rel'] === 'alternate' || !l['@_rel']
      );
      if (alt && alt['@_href']) return alt['@_href'];
      if (link[0] && link[0]['@_href']) return link[0]['@_href'];
    }
  }
  // GUID fallback (RSS 2.0 sometimes uses guid as permalink)
  const guid = item.guid;
  if (typeof guid === 'string') return guid.trim();
  if (guid && guid['#text']) return String(guid['#text']).trim();
  return '';
}

/**
 * Safely parse a date string or unix timestamp to ISO string.
 * Returns null on failure.
 */
function safeDate(val) {
  if (val == null) return null;
  // Handle unix timestamps (numeric, seconds since epoch)
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

/**
 * Generate SHA-256 dedup key from the best available identifier.
 */
function dedupKey(url, title) {
  const input = url || title || String(Date.now());
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Parse a JSON Feed (https://www.jsonfeed.org/) body into NormalizedItem[].
 */
function parseJsonFeed(body) {
  const feed = JSON.parse(body);
  const items = feed.items || [];
  return items.map((item) => {
    const url = item.url || item.id || '';
    const title = item.title || '';
    return {
      title,
      url,
      author: item.author?.name || item.author?.url || '',
      content: item.content_html || item.content_text || item.summary || '',
      published_at: safeDate(item.date_published || item.date_modified),
      dedup_key: dedupKey(url, title),
      metadata: '{}',
    };
  });
}

// ── XML Parser configuration ──

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  isArray: (name) => ['item', 'entry'].includes(name),
});

// ── Main export ──

/**
 * Fetch and parse an RSS/Atom/JSON feed from a source.
 * @param {object} source - Source row with .config JSON string containing { url }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function (from src/http.mjs)
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchRss(source, httpFetch) {
  const config = JSON.parse(source.config);
  const { body, contentType } = await httpFetch(config.url);

  // Detect JSON Feed
  if (
    (contentType && contentType.includes('json')) ||
    body.trimStart().startsWith('{')
  ) {
    try {
      return parseJsonFeed(body);
    } catch {
      // Fall through to XML parsing if JSON parse fails
    }
  }

  // Parse XML (RSS 2.0, Atom 1.0, RDF)
  const parsed = xmlParser.parse(body);

  // Extract raw items from the parsed structure
  const rawItems =
    parsed?.rss?.channel?.item || // RSS 2.0
    parsed?.feed?.entry || // Atom 1.0
    parsed?.RDF?.item || // RDF/RSS 1.0
    [];

  // Map to NormalizedItem[]
  return rawItems.map((item) => {
    const title = extractText(item.title);
    const url = extractLink(item);
    const content = extractText(
      item.encoded || item.content || item.summary || item.description
    );
    const author =
      item.creator || item.author?.name || item.author || '';
    const published_at = safeDate(
      item.pubDate || item.published || item.updated || item.date
    );

    return {
      title,
      url,
      author: typeof author === 'string' ? author : '',
      content,
      published_at,
      dedup_key: dedupKey(url, title),
      metadata: '{}',
    };
  });
}

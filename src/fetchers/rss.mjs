// src/fetchers/rss.mjs -- RSS/Atom/JSON Feed fetcher
// Uses @extractus/feed-extractor for parse-only feed parsing.
import { createHash } from 'crypto';
import { extractFromXml, extractFromJson } from '@extractus/feed-extractor';
import * as cheerio from 'cheerio';

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

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseXmlFallback(body) {
  const $ = cheerio.load(body, { xmlMode: false, decodeEntities: true });
  const entries = [];
  $('item, entry').each((_, node) => {
    if (entries.length >= 50) return false;
    const el = $(node);
    const title = cleanText(el.find('title').first().text());
    const linkHref = el.find('link').first().attr('href');
    const linkText = cleanText(el.find('link').first().text());
    const link = cleanText(linkHref || linkText);
    const description = cleanText(
      el.find('content\\:encoded').first().text() ||
      el.find('description').first().text() ||
      el.find('summary').first().text()
    );
    const published = cleanText(
      el.find('pubDate').first().text() ||
      el.find('published').first().text() ||
      el.find('updated').first().text() ||
      el.find('dc\\:date').first().text()
    );

    if (!title && !link) return;
    entries.push({ title, link, description, published });
  });
  return { entries };
}

/**
 * Fetch and parse an RSS/Atom/JSON feed from a source.
 * @param {object} source - Source row with .config JSON string containing { url }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function (from src/http.mjs)
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchRss(source, httpFetch) {
  const config = JSON.parse(source.config);
  const { body, contentType } = await httpFetch(config.url, 20000, 3, { maxBodyBytes: 1_500_000 });

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
    try {
      feed = extractFromXml(body);
    } catch {
      feed = parseXmlFallback(body);
    }
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

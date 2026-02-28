// src/fetchers/website.mjs -- Website fetcher with RSS autodiscovery + page content fallback
// Discovers RSS/Atom links from a homepage and delegates to fetchRss.
// Falls back to page content extraction via cheerio when no feed is found.
import { createHash } from 'crypto';
import * as cheerio from 'cheerio';
import { fetchRss } from './rss.mjs';

// ── Helpers ──

/**
 * Safely parse a date string to ISO string. Returns null on failure.
 */
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

// ── Main export ──

/**
 * Fetch a website URL. If the page has an RSS/Atom link, delegate to fetchRss.
 * Otherwise extract page content as a single NormalizedItem.
 * @param {object} source - Source row with .config JSON string containing { url }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchWebsite(source, httpFetch) {
  const config = JSON.parse(source.config);
  const { body } = await httpFetch(config.url);
  const $ = cheerio.load(body);

  // RSS autodiscovery: look for <link> tags pointing to feeds
  const rssLink = $(
    'link[type="application/rss+xml"], link[type="application/atom+xml"]'
  )
    .first()
    .attr('href');

  if (rssLink) {
    // Resolve relative URLs against the page URL
    const absoluteUrl = new URL(rssLink, config.url).toString();
    // Delegate to fetchRss with a synthetic source
    return fetchRss(
      { ...source, config: JSON.stringify({ url: absoluteUrl }) },
      httpFetch
    );
  }

  // Page content fallback: extract structured data from the page
  const title = $('title').text().trim();

  let content = $('article, main, .content, .post-content, .entry-content')
    .first()
    .text()
    .trim()
    .slice(0, 5000);
  if (!content) {
    content = $('body').text().trim().slice(0, 2000);
  }
  content = content.replace(/\s+/g, ' ');

  const author = $('meta[name="author"]').attr('content') || '';

  const rawDate =
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').attr('datetime');
  const published_at = safeDate(rawDate);

  const dedup_key = createHash('sha256').update(config.url).digest('hex');

  return [
    {
      title,
      url: config.url,
      author,
      content,
      published_at,
      dedup_key,
      metadata: JSON.stringify({ type: 'page_extract' }),
    },
  ];
}

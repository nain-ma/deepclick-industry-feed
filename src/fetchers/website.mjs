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

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildListingItems($, baseUrl) {
  const seen = new Set();
  const items = [];

  $('article, main article, [class*="post"], [class*="article"], [class*="blog"]').each((_, node) => {
    if (items.length >= 12) return false;
    const el = $(node);
    const anchor = el.find('a[href]').first();
    const href = anchor.attr('href');
    const title = normalizeText(
      el.find('h1, h2, h3, h4').first().text() ||
      anchor.text()
    );
    if (!href || !title || title.length < 12) return;

    const absUrl = new URL(href, baseUrl).toString();
    const u = new URL(absUrl);
    if (u.origin !== new URL(baseUrl).origin) return;
    if (/\/(tag|tags|category|categories|author|authors|topics|search|page)\//i.test(u.pathname)) return;
    if (seen.has(absUrl)) return;
    seen.add(absUrl);

    const content = normalizeText(
      el.find('p').first().text() ||
      el.text()
    ).slice(0, 500);

    const rawDate =
      el.find('time[datetime]').first().attr('datetime') ||
      el.find('meta[property="article:published_time"]').attr('content');

    items.push({
      title,
      url: absUrl,
      author: '',
      content,
      published_at: safeDate(rawDate),
      dedup_key: createHash('sha256').update(absUrl).digest('hex'),
      metadata: JSON.stringify({ type: 'listing_extract' }),
    });
  });

  return items;
}

async function fetchSitemapItems(baseUrl, httpFetch) {
  const origin = new URL(baseUrl).origin;
  const blogPath = new URL(baseUrl).pathname.replace(/\/+$/, '') || '/';
  const strictPrefixMatches = [];
  const looseMatches = [];
  const seenUrls = new Set();
  const sitemapCandidates = [];

  try {
    const { body } = await httpFetch(`${origin}/robots.txt`, 15000, 3, {
      useHeaderGenerator: false,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxBodyBytes: 200_000,
    });
    for (const line of String(body).split('\n')) {
      const match = line.match(/^sitemap:\s*(https?:\/\/\S+)/i);
      if (match) sitemapCandidates.push(match[1].trim());
    }
  } catch {}

  sitemapCandidates.push(`${origin}/sitemap.xml`);

  const seenSitemaps = new Set();
  for (const sitemapUrl of sitemapCandidates) {
    if (!sitemapUrl || seenSitemaps.has(sitemapUrl)) continue;
    seenSitemaps.add(sitemapUrl);
    try {
      const { body } = await httpFetch(sitemapUrl, 20000, 3, {
        useHeaderGenerator: false,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        maxBodyBytes: 1_500_000,
      });
      const $ = cheerio.load(body, { xmlMode: true });
      $('url').each((_, node) => {
        if (strictPrefixMatches.length >= 20) return false;
        const loc = normalizeText($(node).find('loc').first().text());
        const lastmod = normalizeText($(node).find('lastmod').first().text());
        if (!loc) return;
        const u = new URL(loc, origin);
        if (u.origin !== origin) return;
        const isStrict = u.pathname.startsWith(blogPath);
        const isLoose = u.pathname.includes('/blog/');
        if (!isStrict && !isLoose) return;
        if (/\/(tag|tags|category|categories|author|authors|page)\//i.test(u.pathname)) return;
        const slug = u.pathname.split('/').filter(Boolean).pop() || '';
        if (!slug || slug.length < 8) return;
        if (seenUrls.has(u.toString())) return;
        seenUrls.add(u.toString());
        const title = slug
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (ch) => ch.toUpperCase());
        const item = {
          title,
          url: u.toString(),
          author: '',
          content: '',
          published_at: safeDate(lastmod),
          dedup_key: createHash('sha256').update(u.toString()).digest('hex'),
          metadata: JSON.stringify({ type: 'sitemap_extract' }),
        };
        if (isStrict) {
          strictPrefixMatches.push(item);
        } else {
          looseMatches.push(item);
        }
      });
      if (strictPrefixMatches.length > 0) return strictPrefixMatches.slice(0, 20);
    } catch {}
  }

  return looseMatches.slice(0, 20);
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

  const listingItems = buildListingItems($, config.url);
  if (listingItems.length > 0) {
    return listingItems;
  }

  const sitemapItems = await fetchSitemapItems(config.url, httpFetch);
  if (sitemapItems.length > 0) {
    return sitemapItems;
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

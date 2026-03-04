// src/fetchers/rss.mjs -- RSS/Atom/JSON Feed fetcher
// Uses @extractus/feed-extractor for parse-only feed parsing.
// Includes 429 rate-limit aware retry, HTML challenge retry, and XML fallback parsing.
import { createHash } from 'crypto';
import { extractFromXml, extractFromJson } from '@extractus/feed-extractor';
import * as cheerio from 'cheerio';
import { HttpRateLimitError } from '../http.mjs';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 3000;
const MAX_DELAY_MS = 60_000;
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.117 Safari/537.36';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryDelay(attempt, err) {
  if (err?.retryAfterMs != null) {
    return Math.min(err.retryAfterMs + Math.random() * 1000, MAX_DELAY_MS);
  }
  const base = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = base * 0.25 * (Math.random() * 2 - 1);
  return Math.min(base + jitter, MAX_DELAY_MS);
}

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

function dedupKey(url, title, published, id) {
  const normalizedParts = [id, url, title, published]
    .map((part) => cleanText(part))
    .filter(Boolean);
  const input = normalizedParts.join(' | ') || String(Date.now());
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
    const id = cleanText(
      el.find('guid').first().text() ||
      el.find('id').first().text()
    );

    if (!title && !link) return;
    entries.push({ title, link, description, published, id });
  });
  return { entries };
}

async function fetchWithRateLimitRetry(url, httpFetch) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await httpFetch(url, 20000, 3, { maxBodyBytes: 1_500_000 });
    } catch (err) {
      if (err instanceof HttpRateLimitError && attempt < MAX_RETRIES) {
        const delay = retryDelay(attempt, err);
        console.warn(
          `[rss] 429 from ${url} - retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(delay)} ms` +
          (err.retryAfter ? ` (Retry-After: ${err.retryAfter})` : '')
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

export async function fetchRss(source, httpFetch) {
  const config = JSON.parse(source.config);
  let { body, contentType } = await fetchWithRateLimitRetry(config.url, httpFetch);

  if (body.trimStart().startsWith('<!') || body.trimStart().startsWith('<html')) {
    console.warn(`[rss] Got HTML from ${config.url}, retrying with Chrome UA`);
    const retry = await httpFetch(config.url, 20000, 3, {
      useHeaderGenerator: false,
      headers: { 'User-Agent': CHROME_UA, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
      maxBodyBytes: 1_500_000,
    });
    body = retry.body;
    contentType = retry.contentType;
  }

  let feed;
  if (
    (contentType && contentType.includes('json')) ||
    body.trimStart().startsWith('{')
  ) {
    try {
      feed = extractFromJson(body);
    } catch {}
  }

  if (!feed) {
    const xmlBody = body.trim();
    if (xmlBody.startsWith('<!') || xmlBody.startsWith('<html')) {
      throw new Error('Server returned HTML instead of RSS/XML (likely Cloudflare challenge or feed removed)');
    }
    try {
      feed = extractFromXml(xmlBody);
    } catch {
      feed = parseXmlFallback(xmlBody);
    }
  }

  const entries = feed?.entries || [];
  return entries.map((entry) => ({
    title: entry.title || '',
    url: entry.link || '',
    author: '',
    content: entry.description || '',
    published_at: safeDate(entry.published),
    dedup_key: dedupKey(entry.link || '', entry.title || '', entry.published || '', entry.id || ''),
    metadata: '{}',
  }));
}

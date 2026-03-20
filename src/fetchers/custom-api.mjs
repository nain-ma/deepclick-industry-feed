// src/fetchers/custom-api.mjs -- Generic JSON API fetcher with configurable field mapping
// Parses any JSON API response at a configured dot-path and maps fields to NormalizedItem[].
// Supports GET and POST methods, env var substitution in headers, and date templates in body.
import { createHash } from 'crypto';
import { gotScraping } from 'got-scraping';
import { assertSafeFetchUrl } from '../http.mjs';

// ── Helpers ──

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

function getNestedValue(obj, path) {
  if (!path || !obj) return undefined;
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

/**
 * Replace ${ENV_VAR} patterns in a string with environment variable values.
 */
function substituteEnvVars(str) {
  return String(str).replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] || '');
}

/**
 * Replace date template patterns in strings/objects.
 * Supported: {{now}}, {{3_days_ago}}, {{7_days_ago}}, {{N_days_ago}}
 */
function substituteDateTemplates(obj) {
  const str = JSON.stringify(obj);
  const replaced = str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'now') return new Date().toISOString().slice(0, 10);
    const daysAgoMatch = key.match(/^(\d+)_days_ago$/);
    if (daysAgoMatch) {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(daysAgoMatch[1]));
      return d.toISOString().slice(0, 10);
    }
    return match;
  });
  return JSON.parse(replaced);
}

/**
 * Process headers: substitute env vars in all header values.
 */
function processHeaders(headers) {
  if (!headers) return {};
  const result = {};
  for (const [key, value] of Object.entries(headers)) {
    result[key] = substituteEnvVars(value);
  }
  return result;
}

// ── Main export ──

/**
 * Fetch and parse a JSON API response using configurable dot-path and field mapping.
 * Supports GET (default) and POST methods, env var substitution in headers,
 * and date template replacement in body.
 * @param {object} source - Source row with .config JSON
 * @param {function} httpFetch - SSRF-safe HTTP fetch function (used for GET)
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchCustomApi(source, httpFetch) {
  const config = JSON.parse(source.config);

  // Field mapping defaults
  const itemsPath = config.items_path || 'items';
  const titleField = config.title_field || 'title';
  const urlField = config.url_field || 'url';
  const authorField = config.author_field || 'author';
  const contentField = config.content_field || 'content';
  const dateField = config.date_field || 'published_at';
  const idField = config.id_field || 'id';

  let data;
  const method = (config.method || 'GET').toUpperCase();

  if (method === 'POST') {
    await assertSafeFetchUrl(config.url);
    const headers = {
      'Content-Type': 'application/json',
      ...processHeaders(config.headers),
    };
    const body = config.body ? substituteDateTemplates(config.body) : undefined;

    const response = await gotScraping({
      url: config.url,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timeout: { request: 20000 },
      responseType: 'text',
      throwHttpErrors: false,
      useHeaderGenerator: false,
    });

    if (response.statusCode >= 400) {
      throw new Error(`http ${response.statusCode}`);
    }
    data = JSON.parse(response.body);
  } else {
    const fetchHeaders = config.headers ? processHeaders(config.headers) : undefined;
    const fetchOptions = fetchHeaders ? { headers: fetchHeaders, useHeaderGenerator: false } : {};
    const { body } = await httpFetch(config.url, 20000, 3, fetchOptions);
    data = JSON.parse(body);
  }

  // Navigate to items array using dot-path
  const items = getNestedValue(data, itemsPath);
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const title = String(getNestedValue(item, titleField) || '');
    const url = String(getNestedValue(item, urlField) || '');
    const author = String(getNestedValue(item, authorField) || '');
    const content = String(getNestedValue(item, contentField) || '');
    const rawDate = getNestedValue(item, dateField);
    const idValue = getNestedValue(item, idField);

    const dedupInput = String(idValue || url || title || Date.now());
    const dedup_key = createHash('sha256').update(dedupInput).digest('hex');

    return {
      title,
      url,
      author,
      content,
      published_at: safeDate(rawDate),
      dedup_key,
      metadata: '{}',
    };
  });
}

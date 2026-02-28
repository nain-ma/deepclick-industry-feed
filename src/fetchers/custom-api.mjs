// src/fetchers/custom-api.mjs -- Generic JSON API fetcher with configurable field mapping
// Parses any JSON API response at a configured dot-path and maps fields to NormalizedItem[].
// Handles hackernews, github_trending, and custom_api source types via their configs.
import { createHash } from 'crypto';

// ── Helpers ──

/**
 * Safely parse a date value to ISO string. Returns null on failure.
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

/**
 * Navigate into a nested object using a dot-separated path.
 * Returns undefined if the path does not exist.
 */
function getNestedValue(obj, path) {
  if (!path || !obj) return undefined;
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

// ── Main export ──

/**
 * Fetch and parse a JSON API response using configurable dot-path and field mapping.
 * @param {object} source - Source row with .config JSON containing { url, items_path?, title_field?, ... }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function
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

  const { body } = await httpFetch(config.url);
  const data = JSON.parse(body);

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

    // Dedup key: hash the id field value, falling back to url
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

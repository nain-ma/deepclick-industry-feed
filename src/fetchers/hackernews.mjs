// src/fetchers/hackernews.mjs -- Hacker News fetcher via Algolia Search API
// Single API call returns full item data (title, URL, points, comments).
// Not blocked by GFW (uses hn.algolia.com CDN).
import { createHash } from 'crypto';

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

const ALGOLIA_ENDPOINTS = {
  front_page: 'https://hn.algolia.com/api/v1/search?tags=front_page',
  top: 'https://hn.algolia.com/api/v1/search?tags=front_page',
  new: 'https://hn.algolia.com/api/v1/search_by_date?tags=story',
};

/**
 * Fetch Hacker News stories via Algolia Search API.
 * @param {object} source - Source row with .config JSON containing { filter?, min_score?, hits_per_page? }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchHackerNews(source, httpFetch) {
  const config = JSON.parse(source.config);
  const filter = config.filter || 'top';
  const minScore = config.min_score || 0;
  const hitsPerPage = config.hits_per_page || 30;

  const baseUrl = ALGOLIA_ENDPOINTS[filter] || ALGOLIA_ENDPOINTS.top;
  const url = `${baseUrl}&hitsPerPage=${hitsPerPage}`;

  const { body } = await httpFetch(url);
  const data = JSON.parse(body);
  const hits = data?.hits || [];

  return hits
    .filter((hit) => (hit.points || 0) >= minScore)
    .map((hit) => ({
      title: hit.title || '',
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      author: hit.author || '',
      content: hit.story_text || hit.title || '',
      published_at: safeDate(hit.created_at),
      dedup_key: createHash('sha256')
        .update(hit.objectID || hit.url || hit.title)
        .digest('hex'),
      metadata: JSON.stringify({
        points: hit.points,
        num_comments: hit.num_comments,
        hn_id: hit.objectID,
      }),
    }));
}

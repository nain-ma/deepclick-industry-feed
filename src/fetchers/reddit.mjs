// src/fetchers/reddit.mjs -- Reddit subreddit JSON API fetcher
// Retrieves posts from a subreddit via public JSON API and normalizes them.
// Uses old.reddit.com which is more reliable for JSON API access.
import { createHash } from 'crypto';

// ── Config ──

// Reddit's public JSON API can be slow, especially through proxies.
// 45 s accommodates slow responses without hitting the collector's retry budget.
const REDDIT_TIMEOUT_MS = 45_000;

// Use a real browser UA to avoid Reddit bot detection / silent blocks.
const REDDIT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.117 Safari/537.36';

// ── Helpers ──

/**
 * Safely parse a date value (including Unix timestamps) to ISO string.
 * Reddit uses Unix timestamps (seconds since epoch).
 * Returns null on failure.
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
 * Fetch posts from a Reddit subreddit via public JSON API.
 * @param {object} source - Source row with .config JSON string containing { subreddit, sort?, limit? }
 * @param {function} httpFetch - SSRF-safe HTTP fetch function
 * @returns {Promise<NormalizedItem[]>}
 */
export async function fetchReddit(source, httpFetch) {
  const config = JSON.parse(source.config);
  const subreddit = config.subreddit;
  const sort = config.sort || 'hot';
  const limit = config.limit || 25;

  // old.reddit.com is lighter-weight and more reliable for JSON API access
  // than www.reddit.com (which often serves the SPA shell or blocks bots).
  const url = `https://old.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;
  // Disable browser header generation — Reddit's JSON API returns HTML for browser-like requests
  const { body } = await httpFetch(url, REDDIT_TIMEOUT_MS, 3, {
    useHeaderGenerator: false,
    headers: {
      'User-Agent': REDDIT_USER_AGENT,
      'Accept': 'application/json',
    },
  });
  const data = JSON.parse(body);

  const children = data?.data?.children || [];

  return children
    .filter((p) => p.kind === 't3')
    .map((p) => {
      const d = p.data;
      return {
        title: d.title,
        url: d.url || `https://www.reddit.com${d.permalink}`,
        author: d.author,
        content: d.selftext || d.title,
        published_at: safeDate(d.created_utc),
        dedup_key: createHash('sha256')
          .update(d.id || d.permalink)
          .digest('hex'),
        metadata: JSON.stringify({
          score: d.score,
          num_comments: d.num_comments,
          subreddit: d.subreddit,
        }),
      };
    });
}

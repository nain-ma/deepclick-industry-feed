// src/collector.mjs -- Collection orchestrator
// Queries due sources, dispatches to the correct fetcher by type,
// writes results with dedup, updates health status, returns summary.
import { getDb, getDueSources, insertRawItemsBatch, updateSourceSuccess, updateSourceFailure } from './db.mjs';
import { httpFetch } from './http.mjs';
import { fetchRss } from './fetchers/rss.mjs';
import { fetchWebsite } from './fetchers/website.mjs';
import { fetchReddit } from './fetchers/reddit.mjs';
import { fetchXProxy } from './fetchers/x-proxy.mjs';
import { fetchCustomApi } from './fetchers/custom-api.mjs';
import { fetchHackerNews } from './fetchers/hackernews.mjs';

/**
 * Maps source types to their fetcher functions.
 * Covers all types from resolveSourceUrl + custom_api.
 */
const FETCHER_MAP = {
  rss:             fetchRss,
  digest_feed:     fetchRss,        // JSON Feed uses same parser
  website:         fetchWebsite,
  reddit:          fetchReddit,
  twitter_feed:    fetchXProxy,
  twitter_list:    fetchXProxy,
  hackernews:      fetchHackerNews,  // HN via Algolia Search API
  github_trending: fetchCustomApi,   // GitHub trending is a custom API
  custom_api:      fetchCustomApi,
};

/**
 * Retry a function with exponential backoff.
 */
async function withRetry(fn, retries = 1, delay = 2000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Run async tasks concurrently with a concurrency limit.
 */
async function runConcurrent(tasks, concurrency = 5) {
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      await tasks[i]();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );
}

/**
 * Run one collection cycle: fetch all due sources and return a summary.
 * Each source is isolated -- one failure does not abort the run.
 * Uses concurrency pool (5 parallel) and 1 retry per source.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {{ intervalMinutes?: number }} options
 * @returns {Promise<{ sources: number, processed: number, items: number, errors: number }>}
 */
export async function runCollection(db, options = {}) {
  const intervalMinutes = options.intervalMinutes || 60;
  const dueSources = getDueSources(db, intervalMinutes);
  const results = { sources: dueSources.length, processed: 0, items: 0, errors: 0 };

  const tasks = dueSources.map(source => async () => {
    const fetcher = FETCHER_MAP[source.type];

    if (!fetcher) {
      console.warn('No fetcher for source type: ' + source.type);
      results.errors++;
      updateSourceFailure(db, source.id, 'No fetcher for type: ' + source.type);
      return;
    }

    try {
      const items = await withRetry(() => fetcher(source, httpFetch), 1, 2000);
      const inserted = insertRawItemsBatch(db, source.id, items);
      updateSourceSuccess(db, source.id);
      results.processed++;
      results.items += inserted;
      console.log('Collected ' + source.name + ': ' + inserted + ' new items (' + items.length + ' total)');
    } catch (err) {
      updateSourceFailure(db, source.id, err.message);
      results.errors++;
      console.error('Failed ' + source.name + ': ' + err.message);
    }
  });

  await runConcurrent(tasks, 5);
  return results;
}

// CLI entry: `node src/collector.mjs` runs one collection cycle
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const db = getDb();
  console.log('Starting collection run...');
  runCollection(db).then(results => {
    console.log('Collection complete:', JSON.stringify(results, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('Collection failed:', err);
    process.exit(1);
  });
}

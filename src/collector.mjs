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
  hackernews:      fetchCustomApi,   // HN API is a custom JSON API
  github_trending: fetchCustomApi,   // GitHub trending is a custom API
  custom_api:      fetchCustomApi,
};

/**
 * Run one collection cycle: fetch all due sources and return a summary.
 * Each source is isolated -- one failure does not abort the run.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {{ intervalMinutes?: number }} options
 * @returns {Promise<{ sources: number, processed: number, items: number, errors: number }>}
 */
export async function runCollection(db, options = {}) {
  const intervalMinutes = options.intervalMinutes || 60;
  const dueSources = getDueSources(db, intervalMinutes);
  const results = { sources: dueSources.length, processed: 0, items: 0, errors: 0 };

  for (const source of dueSources) {
    const fetcher = FETCHER_MAP[source.type];

    if (!fetcher) {
      console.warn('No fetcher for source type: ' + source.type);
      results.errors++;
      updateSourceFailure(db, source.id, 'No fetcher for type: ' + source.type);
      continue;
    }

    try {
      const items = await fetcher(source, httpFetch);
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
  }

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

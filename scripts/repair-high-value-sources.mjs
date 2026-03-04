#!/usr/bin/env node

import { getDb } from '../src/db.mjs';

const db = getDb();

const REPAIRS = [
  {
    name: 'Optimizely Blog',
    type: 'website',
    config: { url: 'https://www.optimizely.com/insights/blog/' },
  },
  {
    name: 'Instapage Blog',
    type: 'rss',
    config: { url: 'https://instapage.com/blog/feed' },
  },
  {
    name: 'VWO Blog',
    type: 'rss',
    config: { url: 'https://vwo.com/blog/feed/' },
  },
  {
    name: 'Jon Loomer Digital',
    type: 'rss',
    config: { url: 'https://www.jonloomer.com/feed/' },
  },
];

const bridgeCandidates = (process.env.X_PROXY_CANDIDATES || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const updateSource = db.prepare(`
  UPDATE sources
  SET type = ?, config = ?, is_active = 1, fetch_error_count = 0, last_error = NULL, updated_at = datetime('now')
  WHERE name = ?
`);

const selectTwitter = db.prepare(`
  SELECT id, name, config
  FROM sources
  WHERE type IN ('twitter_feed', 'twitter_list')
`);

const updateTwitter = db.prepare(`
  UPDATE sources
  SET config = ?, is_active = 1, fetch_error_count = 0, last_error = NULL, updated_at = datetime('now')
  WHERE id = ?
`);

let repaired = 0;
for (const repair of REPAIRS) {
  const result = updateSource.run(repair.type, JSON.stringify(repair.config), repair.name);
  repaired += result.changes;
}

let retargetedTwitter = 0;
if (bridgeCandidates.length > 0) {
  const rows = selectTwitter.all();
  for (const row of rows) {
    let config;
    try {
      config = JSON.parse(row.config || '{}');
    } catch {
      config = {};
    }
    config.proxy_candidates = bridgeCandidates;
    delete config.proxy_base;
    delete config.rsshub_url;
    updateTwitter.run(JSON.stringify(config), row.id);
    retargetedTwitter++;
  }
}

console.log(JSON.stringify({
  repaired_sources: repaired,
  twitter_sources_retargeted: retargetedTwitter,
  bridge_candidates: bridgeCandidates,
}, null, 2));

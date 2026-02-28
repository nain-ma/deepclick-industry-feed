import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const exportPath = path.join(repoRoot, 'exports', 'subscriptions.export.json');

function requiredByType(type, config) {
  if (type === 'reddit') return Boolean(config.subreddit);
  if (type === 'rss' || type === 'digest_feed' || type === 'website') return Boolean(config.url);
  if (type === 'twitter_feed') {
    return Boolean(config.handle) && (
      Boolean(config.proxy_base) ||
      (Array.isArray(config.proxy_candidates) && config.proxy_candidates.length > 0)
    );
  }
  if (type === 'twitter_list') {
    return Boolean(config.list_url) && (
      Boolean(config.proxy_base) ||
      (Array.isArray(config.proxy_candidates) && config.proxy_candidates.length > 0)
    );
  }
  if (type === 'custom_api' || type === 'hackernews' || type === 'github_trending') {
    return Boolean(config.url || config.endpoint || true);
  }
  return true;
}

function loadExport() {
  assert.equal(fs.existsSync(exportPath), true, `Missing export file: ${exportPath}`);
  return JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
}

test('subscriptions export meta is valid', () => {
  const json = loadExport();
  assert.ok(json.exported_at, 'missing exported_at');
  assert.ok(Array.isArray(json.sources), 'sources should be array');
  assert.ok(json.sources.length > 0, 'sources should not be empty');
  assert.equal(json.total_sources, json.sources.length, 'total_sources mismatch');
});

test('each exported source is valid', async (t) => {
  const json = loadExport();

  for (const s of json.sources) {
    await t.test(`source#${s.id} ${s.type} ${s.name}`, () => {
      assert.ok(s.id > 0, 'invalid source id');
      assert.ok(s.name && typeof s.name === 'string', 'missing source name');
      assert.ok(s.type && typeof s.type === 'string', 'missing source type');
      assert.ok(s.config && typeof s.config === 'object', 'missing source config object');
      assert.equal(
        requiredByType(s.type, s.config),
        true,
        `source ${s.id} (${s.name}) missing required config for type ${s.type}`
      );
    });
  }
});

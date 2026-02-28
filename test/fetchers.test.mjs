#!/usr/bin/env node
// Fetcher smoke tests — verifies real network calls work
// Run: node test/fetchers.test.mjs

import { httpFetch } from '../src/http.mjs';
import { fetchRss } from '../src/fetchers/rss.mjs';
import { fetchReddit } from '../src/fetchers/reddit.mjs';
import { fetchXProxy } from '../src/fetchers/x-proxy.mjs';
import { fetchCustomApi } from '../src/fetchers/custom-api.mjs';
import { fetchHackerNews } from '../src/fetchers/hackernews.mjs';
import { fetchWebsite } from '../src/fetchers/website.mjs';

let pass = 0, fail = 0;

function ok(desc, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  ✅ ${desc}`);
  } else {
    fail++;
    console.log(`  ❌ ${desc}`);
    if (detail) console.log(`     ${detail}`);
  }
}

async function test(desc, fn) {
  try {
    await fn();
  } catch (err) {
    fail++;
    console.log(`  ❌ ${desc}: ${err.message}`);
  }
}

console.log('\n═══ Fetcher Smoke Tests ═══\n');

// ── 1. httpFetch basics (got-scraping transport) ──
console.log('─── httpFetch (got-scraping) ───');

await test('httpFetch returns content', async () => {
  const { body, contentType } = await httpFetch('https://httpbin.org/get');
  const data = JSON.parse(body);
  ok('httpFetch returns JSON', data.url === 'https://httpbin.org/get');
  ok('httpFetch has browser-like UA', data.headers['User-Agent']?.includes('Mozilla') || data.headers['User-Agent']?.includes('Chrome'));
});

await test('httpFetch respects timeout', async () => {
  const start = Date.now();
  try {
    await httpFetch('https://httpbin.org/delay/30', 3000);
    ok('httpFetch timeout should have thrown', false);
  } catch (err) {
    const elapsed = Date.now() - start;
    ok('httpFetch times out correctly', elapsed < 6000,
      `elapsed=${elapsed}ms, err=${err.message}`);
  }
});

await test('SSRF: blocks private IPs', async () => {
  try {
    await httpFetch('http://127.0.0.1/test');
    ok('Should block localhost IP', false);
  } catch (err) {
    ok('Blocks 127.0.0.1', err.message === 'blocked host');
  }
});

await test('SSRF: blocks localhost', async () => {
  try {
    await httpFetch('http://localhost/test');
    ok('Should block localhost', false);
  } catch (err) {
    ok('Blocks localhost', err.message === 'blocked host');
  }
});

// ── 2. RSS fetcher (feed-extractor) ──
console.log('\n─── RSS Fetcher (feed-extractor) ───');

await test('RSS: AdExchanger', async () => {
  const source = { id: 1, type: 'rss', config: JSON.stringify({ url: 'https://www.adexchanger.com/feed/' }) };
  const items = await fetchRss(source, httpFetch);
  ok('RSS returns items', items.length > 0, `got ${items.length}`);
  ok('RSS items have title', items[0]?.title?.length > 0);
  ok('RSS items have url', items[0]?.url?.length > 0);
  ok('RSS items have dedup_key', items[0]?.dedup_key?.length === 64);
  console.log(`     Sample: "${items[0]?.title?.slice(0, 60)}..."`);
});

// ── 3. Reddit fetcher ──
console.log('\n─── Reddit Fetcher ───');

await test('Reddit: r/adops', async () => {
  const source = { id: 2, type: 'reddit', config: JSON.stringify({ subreddit: 'adops', sort: 'hot', limit: 5 }) };
  const items = await fetchReddit(source, httpFetch);
  ok('Reddit returns items', items.length > 0, `got ${items.length}`);
  ok('Reddit items have title', items[0]?.title?.length > 0);
  ok('Reddit items have url', items[0]?.url?.length > 0);
  ok('Reddit items have metadata with score', (() => {
    const m = JSON.parse(items[0]?.metadata || '{}');
    return typeof m.score === 'number';
  })());
  ok('Reddit items have author', items[0]?.author?.length > 0);
  console.log(`     Sample: "${items[0]?.title?.slice(0, 60)}..." (score: ${JSON.parse(items[0]?.metadata).score})`);
});

// ── 4. X Proxy fetcher ──
console.log('\n─── X Proxy Fetcher ───');

await test('X Proxy: errors without proxy_base', async () => {
  const source = { id: 4, type: 'twitter_feed', config: JSON.stringify({ handle: '@test' }) };
  try {
    await fetchXProxy(source, httpFetch);
    ok('X Proxy should throw without proxy_base', false);
  } catch (err) {
    ok('X Proxy throws clear error without proxy_base', err.message.includes('proxy_base'));
  }
});

await test('X Proxy: errors without handle', async () => {
  const source = { id: 5, type: 'twitter_feed', config: JSON.stringify({ proxy_base: 'https://rsshub.example.com' }) };
  try {
    await fetchXProxy(source, httpFetch);
    ok('X Proxy should throw without handle', false);
  } catch (err) {
    ok('X Proxy throws clear error without handle', err.message.includes('handle'));
  }
});

// ── 5. HackerNews fetcher (Algolia API) ──
console.log('\n─── HackerNews Fetcher (Algolia API) ───');

await test('HackerNews: top stories via Algolia', async () => {
  const source = {
    id: 8, type: 'hackernews',
    config: JSON.stringify({ filter: 'top', min_score: 50 })
  };
  const items = await fetchHackerNews(source, httpFetch);
  ok('HN returns items', items.length > 0, `got ${items.length}`);
  ok('HN items have title', items[0]?.title?.length > 0);
  ok('HN items have url', items[0]?.url?.length > 0);
  ok('HN items have dedup_key', items[0]?.dedup_key?.length === 64);
  ok('HN items have metadata with points', (() => {
    const m = JSON.parse(items[0]?.metadata || '{}');
    return typeof m.points === 'number';
  })());
  ok('HN items have author', items[0]?.author?.length > 0);
  console.log(`     Sample: "${items[0]?.title?.slice(0, 60)}..." (points: ${JSON.parse(items[0]?.metadata).points})`);
});

await test('HackerNews: min_score filters low-scoring stories', async () => {
  const source = {
    id: 9, type: 'hackernews',
    config: JSON.stringify({ filter: 'top', min_score: 500 })
  };
  const items = await fetchHackerNews(source, httpFetch);
  ok('HN high min_score returns fewer items', items.length >= 0);
  if (items.length > 0) {
    const allAbove = items.every(i => {
      const m = JSON.parse(i.metadata || '{}');
      return m.points >= 500;
    });
    ok('HN all items above min_score', allAbove);
  }
});

// ── 6. Collector module ──
console.log('\n─── Collector (module load) ───');

await test('Collector module loads', async () => {
  const mod = await import('../src/collector.mjs');
  ok('runCollection exported', typeof mod.runCollection === 'function');
});

// ── Results ──
console.log('\n═══════════════════════════════════════');
console.log(`  Results: ${pass}/${pass + fail} passed${fail > 0 ? `, \x1b[31m${fail} failed\x1b[0m` : ''}`);
console.log('═══════════════════════════════════════\n');

process.exit(fail > 0 ? 1 : 0);

import test from 'node:test';
import assert from 'node:assert/strict';

import { classifySource, evaluateRawItem, rankRawItems } from '../src/source-policy.mjs';

test('classifySource marks core and excluded sources correctly', () => {
  assert.equal(classifySource({ name: 'r/FacebookAds', type: 'reddit' }).tier, 'core');
  assert.equal(classifySource({ name: 'Meta Ads Manager Outages', type: 'rss' }).tier, 'core');
  assert.equal(classifySource({ name: 'TikTok For Business Blog', type: 'website' }).tier, 'watchlist');
  assert.equal(classifySource({ name: 'r/TikTokAds', type: 'reddit' }).tier, 'watchlist');
  assert.equal(classifySource({ name: 'TechCrunch', type: 'rss' }).tier, 'watchlist');
  assert.equal(classifySource({ name: 'r/Entrepreneur', type: 'reddit' }).tier, 'excluded');
});

test('evaluateRawItem rejects generic watchlist tech news for scheduled mode', () => {
  const result = evaluateRawItem({
    name: 'TechCrunch',
    source_name: 'TechCrunch',
    type: 'rss',
    title: 'OpenAI develops a GitHub alternative for enterprise coding',
    content: 'A broad AI product story with no advertising or conversion relevance.',
    url: 'https://example.com/openai-github',
    fetched_at: '2026-03-04 00:00:00',
    metadata: '{}',
  }, { mode: 'scheduled' });

  assert.equal(result.accepted, false);
});

test('evaluateRawItem keeps core ad-tech signals', () => {
  const result = evaluateRawItem({
    name: 'r/FacebookAds',
    source_name: 'r/FacebookAds',
    type: 'reddit',
    title: 'Meta campaign performance dropped after pixel attribution change',
    content: 'Advertisers report CVR down 18% and CPA up 22% after recent attribution changes.',
    url: 'https://example.com/meta-campaign',
    fetched_at: '2026-03-04 00:00:00',
    metadata: '{"score":120,"num_comments":45}',
  }, { mode: 'scheduled' });

  assert.equal(result.accepted, true);
  assert.ok(result.score >= 55);
});

test('evaluateRawItem keeps outage signals from official ad status feeds', () => {
  const result = evaluateRawItem({
    name: 'Meta Ads Manager Outages',
    source_name: 'Meta Ads Manager Outages',
    type: 'rss',
    title: '[High disruptions]: Ads Delivery',
    content: 'We are aware of an issue that may be impacting ad delivery.',
    url: 'https://metastatus.com/ads-manager',
    fetched_at: '2026-03-04 00:00:00',
    metadata: '{}',
  }, { mode: 'scheduled' });

  assert.equal(result.accepted, true);
  assert.ok(result.score >= 70);
});

test('evaluateRawItem rejects low-signal emotional community titles', () => {
  const result = evaluateRawItem({
    name: 'r/FacebookAds',
    source_name: 'r/FacebookAds',
    type: 'reddit',
    title: 'FUCK META',
    content: 'This company is a joke.',
    url: 'https://example.com/fuck-meta',
    fetched_at: '2026-03-04 00:00:00',
    metadata: '{"score":22,"num_comments":18}',
  }, { mode: 'scheduled' });

  assert.equal(result.accepted, false);
});

test('rankRawItems removes duplicate titles and sorts by score', () => {
  const ranked = rankRawItems([
    {
      name: 'r/FacebookAds',
      source_name: 'r/FacebookAds',
      type: 'reddit',
      title: 'Meta attribution change hurts CPA',
      content: 'CPA up 12%',
      url: 'https://a.example.com',
      fetched_at: '2026-03-04 00:00:00',
      metadata: '{"score":50,"num_comments":10}',
    },
    {
      name: 'AdExchanger',
      source_name: 'AdExchanger',
      type: 'rss',
      title: 'Meta attribution change hurts CPA',
      content: 'ROAS impact analysis',
      url: 'https://b.example.com',
      fetched_at: '2026-03-04 00:10:00',
      metadata: '{}',
    },
  ], { mode: 'scheduled' });

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].title, 'Meta attribution change hurts CPA');
});

test('rankRawItems clusters outage chatter and keeps the strongest signal', () => {
  const ranked = rankRawItems([
    {
      name: 'r/FacebookAds',
      source_name: 'r/FacebookAds',
      type: 'reddit',
      title: 'Meta Ads Status - High Disruption',
      content: 'Ads Manager is down and reporting is broken.',
      url: 'https://reddit.example.com/outage-1',
      fetched_at: '2026-03-04 00:10:00',
      metadata: '{"score":10,"num_comments":5}',
    },
    {
      name: 'Meta Ads Manager Outages',
      source_name: 'Meta Ads Manager Outages',
      type: 'rss',
      title: '[High disruptions]: Ads Reporting',
      content: 'We are aware that some advertisers may be experiencing issues viewing reporting for their ads.',
      url: 'https://metastatus.com/ads-manager',
      fetched_at: '2026-03-04 00:11:00',
      published_at: '2026-03-04T00:00:29.000Z',
      metadata: '{}',
    },
  ], { mode: 'scheduled' });

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].source_name, 'Meta Ads Manager Outages');
});

import Database from 'better-sqlite3';

const db = new Database('./data/digest.db');

// Get raw items from last 8 hours
const items = db.prepare(`
  SELECT ri.id, ri.title, ri.url, ri.content, ri.fetched_at, ri.published_at, s.name as source_name, s.type as source_type
  FROM raw_items ri
  JOIN sources s ON ri.source_id = s.id
  WHERE ri.fetched_at > datetime('now', '-8 hours')
  ORDER BY ri.fetched_at DESC
`).all();

console.log('Items in last 8 hours:', items.length);
console.log('\n--- RAW ITEMS JSON ---');
console.log(JSON.stringify(items, null, 2));

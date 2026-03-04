import Database from 'better-sqlite3';

const db = new Database('./data/digest.db');

// Get raw items count
const count = db.prepare('SELECT COUNT(*) as total FROM raw_items').get();
console.log('Total raw items:', count.total);

// Get recent items
const recent = db.prepare(`
  SELECT ri.id, ri.title, ri.url, ri.fetched_at, s.name as source_name
  FROM raw_items ri
  JOIN sources s ON ri.source_id = s.id
  ORDER BY ri.fetched_at DESC
  LIMIT 50
`).all();

console.log('\nRecent items:');
recent.forEach((item, i) => {
  const title = (item.title || '(no title)').substring(0, 80);
  console.log(`${i+1}. [${item.source_name}] ${title}`);
});

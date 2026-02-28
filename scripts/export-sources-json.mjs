import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dbPath = process.env.AI_DIGEST_DB
  ? path.resolve(process.env.AI_DIGEST_DB)
  : path.join(repoRoot, 'data', 'digest.db');
const outPath = path.join(repoRoot, 'exports', 'subscriptions.export.json');

const db = new Database(dbPath, { readonly: true });

const rows = db.prepare(`
  SELECT id, name, type, config, is_active, is_public, is_deleted,
         last_fetched_at, last_success_at, fetch_error_count, last_error
  FROM sources
  ORDER BY id ASC
`).all();

const sources = rows.map((r) => {
  let config = {};
  try { config = JSON.parse(r.config || '{}'); } catch {}
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    config,
    status: {
      is_active: r.is_active,
      is_public: r.is_public,
      is_deleted: r.is_deleted,
      last_fetched_at: r.last_fetched_at,
      last_success_at: r.last_success_at,
      fetch_error_count: r.fetch_error_count,
      last_error: r.last_error,
    },
  };
});

const payload = {
  exported_at: new Date().toISOString(),
  db_path: dbPath,
  total_sources: sources.length,
  by_type: sources.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {}),
  sources,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');

console.log(`Exported ${sources.length} sources -> ${outPath}`);

-- Migration 011: source layer classification + digest item history
-- Requirements: SEO Signal Radar change

-- Source layer classification (publish, discuss, trend)
ALTER TABLE sources ADD COLUMN layer TEXT DEFAULT 'publish'
  CHECK(layer IN ('publish', 'discuss', 'trend'));

-- Digest history for novelty tracking (already-reported dedup)
CREATE TABLE IF NOT EXISTS digest_item_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  digest_id INTEGER NOT NULL REFERENCES digests(id),
  cluster_key TEXT NOT NULL,
  item_title TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dih_cluster ON digest_item_history(cluster_key);
CREATE INDEX IF NOT EXISTS idx_dih_created ON digest_item_history(created_at DESC);

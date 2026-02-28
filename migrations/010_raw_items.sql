-- Migration 010: raw_items table + source health tracking columns
-- Requirements: FOUND-01 (raw_items), FOUND-02 (source health columns)

-- New table: raw_items (collected content storage with dedup)
CREATE TABLE IF NOT EXISTS raw_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  author TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  published_at TEXT,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  dedup_key TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  UNIQUE(source_id, dedup_key)
);
CREATE INDEX IF NOT EXISTS idx_raw_items_source_fetched ON raw_items(source_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_items_fetched ON raw_items(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_items_dedup ON raw_items(dedup_key);

-- Source health tracking columns (FOUND-02)
-- NOTE: last_fetched_at already exists from migration 003, do NOT re-add
-- NOTE: fetch_count already exists from migration 003, do NOT re-add
ALTER TABLE sources ADD COLUMN fetch_error_count INTEGER DEFAULT 0;
ALTER TABLE sources ADD COLUMN last_error TEXT;
ALTER TABLE sources ADD COLUMN last_success_at TEXT;

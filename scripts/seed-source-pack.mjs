#!/usr/bin/env node
// scripts/seed-source-pack.mjs
// Idempotent seed script for the DeepClick Industry Radar source pack.
// Safe to run multiple times -- checks for existing pack by slug before inserting.

import { getDb } from '../src/db.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PACK_SLUG = 'deepclick-industry-radar';
const PACK_NAME = 'DeepClick Industry Radar';
const PACK_DESCRIPTION =
  'Curated industry intelligence sources for DeepClick growth leads. ' +
  'Covers AdTech, MarTech, Post-click Optimization, Attribution & Privacy, ' +
  'and Growth Infrastructure.';

try {
  // 1. Read source pack JSON from companion file
  const sourcesPath = join(__dirname, 'deepclick-industry-radar.json');
  const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));

  // 2. Open database
  const db = getDb();

  // 3. Check idempotency -- skip if pack already exists
  const existing = db
    .prepare('SELECT id FROM source_packs WHERE slug = ?')
    .get(PACK_SLUG);

  if (existing) {
    console.log(
      `DeepClick Industry Radar source pack already exists (id: ${existing.id}), skipping.`
    );
    process.exit(0);
  }

  // 4. Insert the source pack
  const result = db
    .prepare(
      'INSERT INTO source_packs (name, description, slug, sources_json, created_by, is_public) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(PACK_NAME, PACK_DESCRIPTION, PACK_SLUG, JSON.stringify(sources), null, 1);

  console.log(
    `Created DeepClick Industry Radar source pack (id: ${result.lastInsertRowid})`
  );
  process.exit(0);
} catch (err) {
  console.error('Failed to seed source pack:', err.message);
  process.exit(1);
}

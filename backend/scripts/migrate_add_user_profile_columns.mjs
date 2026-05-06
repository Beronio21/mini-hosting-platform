import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'platform.db');

function ensureDir(p) {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

ensureDir(DB_PATH);

const db = new Database(DB_PATH);

function tableExists(name) {
  const r = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(name);
  return !!r;
}

function getColumns(table) {
  try {
    const rows = db.prepare(`PRAGMA table_info(${table})`).all();
    return rows.map(r => r.name);
  } catch (e) {
    return [];
  }
}

async function run() {
  console.log('DB path:', DB_PATH);

  if (!tableExists('users')) {
    console.log('users table not found; attempting to create via schema.sql');
    const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('Schema executed');
    } else {
      console.error('schema.sql not found at', schemaPath);
      process.exit(1);
    }
  }

  const needed = [
    'first_name', 'last_name', 'phone', 'bio', 'address', 'country', 'city_state', 'postal_code', 'tax_id'
  ];

  const cols = getColumns('users');

  for (const c of needed) {
    if (!cols.includes(c)) {
      console.log(`Adding column ${c}`);
      try {
        db.prepare(`ALTER TABLE users ADD COLUMN ${c} TEXT`).run();
      } catch (e) {
        console.error('Failed to add column', c, e.message || e);
      }
    } else {
      console.log(`Column ${c} already exists`);
    }
  }

  console.log('Migration complete');
  db.close();
}

run().catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});

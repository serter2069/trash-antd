import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'trash.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY,
    email TEXT,
    code TEXT,
    created_at TEXT
  );
  CREATE TABLE IF NOT EXISTS thoughts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    text TEXT,
    created_at TEXT
  );
`);

export default db;

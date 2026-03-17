const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function createDatabase(dbPath) {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      cultivation TEXT,
      planting_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT current_timestamp
    )
  `);
  return db;
}

const db = createDatabase(path.join(__dirname, '../../data/garden.db'));

module.exports = db;
module.exports.createDatabase = createDatabase;

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
      common_name TEXT,
      scientific_name TEXT,
      genus TEXT,
      family TEXT,
      sunlight_preference TEXT,
      soil_type TEXT,
      common_pests_diseases TEXT,
      toxicity TEXT,
      type TEXT,
      cultivation TEXT,
      planting_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT current_timestamp
    )
  `);

  const existingColumns = db
    .prepare('PRAGMA table_info(plants)')
    .all()
    .map((column) => column.name);

  const columnsToAdd = [
    { name: 'common_name', definition: 'TEXT' },
    { name: 'scientific_name', definition: 'TEXT' },
    { name: 'genus', definition: 'TEXT' },
    { name: 'family', definition: 'TEXT' },
    { name: 'sunlight_preference', definition: 'TEXT' },
    { name: 'soil_type', definition: 'TEXT' },
    { name: 'common_pests_diseases', definition: 'TEXT' },
    { name: 'toxicity', definition: 'TEXT' }
  ];

  columnsToAdd.forEach((column) => {
    if (!existingColumns.includes(column.name)) {
      db.exec(`ALTER TABLE plants ADD COLUMN ${column.name} ${column.definition}`);
    }
  });

  return db;
}

const db = createDatabase(path.join(__dirname, '../../data/garden.db'));

module.exports = db;
module.exports.createDatabase = createDatabase;

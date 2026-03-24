const sqlite3 = require('sqlite3').verbose();

// Use in-memory database for Render (ephemeral filesystem)
const dbPath = process.env.NODE_ENV === 'production' ? ':memory:' : './sermoes.db';

console.log('Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('Erro ao criar tabela usuarios:', err.message);
    }
  });

  // Sermons table
  db.run(`
    CREATE TABLE IF NOT EXISTS sermoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      data TEXT NOT NULL,
      local TEXT,
      usuario_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('Erro ao criar tabela sermoes:', err.message);
    }
  });

  // Add local column if not exists (migration)
  db.run(`ALTER TABLE sermoes ADD COLUMN local TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      // Ignore silently, it might already exist
    }
  });

  console.log('Database initialization completed');
});

module.exports = db;
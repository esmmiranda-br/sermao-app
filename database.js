const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('./sermoes.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

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
  `);

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
  `);

  // Add local column if not exists (migration)
  db.run(`ALTER TABLE sermoes ADD COLUMN local TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna local:', err.message);
    }
  });
});

module.exports = db;
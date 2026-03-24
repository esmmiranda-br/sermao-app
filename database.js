const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

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

  // Auto-seed: criar usuário admin se não existir
  db.get('SELECT * FROM usuarios WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuário admin:', err.message);
    } else if (!row) {
      // Usuário admin não existe, criar
      bcrypt.hash('123456', 10, (err, hashedPassword) => {
        if (err) {
          console.error('Erro ao hash password:', err.message);
        } else {
          const sql = 'INSERT INTO usuarios (username, password) VALUES (?, ?)';
          db.run(sql, ['admin', hashedPassword], (err) => {
            if (err) {
              console.error('Erro ao criar usuário admin:', err.message);
            } else {
              console.log('Usuário admin criado automaticamente');
            }
          });
        }
      });
    } else {
      console.log('Usuário admin já existe');
    }
  });

  console.log('Database initialization completed');
});

module.exports = db;
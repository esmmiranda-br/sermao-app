const Database = require('better-sqlite3');

// Use in-memory database for Render (ephemeral filesystem)
const dbPath = process.env.NODE_ENV === 'production' ? ':memory:' : './sermoes.db';

console.log('Database path:', dbPath);

// Create database connection
let db;
try {
  db = new Database(dbPath);
  console.log('Conectado ao banco de dados SQLite.');
} catch (err) {
  console.error('Erro ao conectar ao banco de dados:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
try {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sermons table
  db.exec(`
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
  try {
    db.exec(`ALTER TABLE sermoes ADD COLUMN local TEXT`);
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna local:', err.message);
    }
  }

  // Auto-seed: criar usuário admin se não existir
  const checkAdmin = db.prepare('SELECT * FROM usuarios WHERE username = ?');
  const adminRow = checkAdmin.get('admin');

  if (!adminRow) {
    // Usuário admin não existe, criar
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const insertAdmin = db.prepare('INSERT INTO usuarios (username, password) VALUES (?, ?)');
    insertAdmin.run('admin', hashedPassword);
    console.log('Usuário admin criado automaticamente');
  } else {
    console.log('Usuário admin já existe');
  }

  console.log('Database initialization completed');
} catch (err) {
  console.error('Erro na inicialização do banco:', err.message);
  process.exit(1);
}

module.exports = db;

module.exports = db;
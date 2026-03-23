const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_aqui';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware para verificar token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  const sql = 'SELECT * FROM usuarios WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!result) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token });
    });
  });
});

// Rota para registrar usuário (opcional, para criar admin)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const sql = 'INSERT INTO usuarios (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: 'Usuário criado', id: this.lastID });
    });
  });
});

// Sermons routes (protegidas)

// POST route to save sermon
app.post('/sermoes', authenticateToken, (req, res) => {
  const { titulo, conteudo, data, local } = req.body;
  const usuario_id = req.user.id;

  if (!titulo || !conteudo || !data) {
    return res.status(400).json({ error: 'Título, conteúdo e data são obrigatórios' });
  }

  const sql = 'INSERT INTO sermoes (titulo, conteudo, data, local, usuario_id) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [titulo, conteudo, data, local || null, usuario_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: 'Sermão salvo com sucesso', id: this.lastID });
  });
});

// GET route to retrieve all sermons for the user
app.get('/sermoes', authenticateToken, (req, res) => {
  const usuario_id = req.user.id;
  const sql = 'SELECT * FROM sermoes WHERE usuario_id = ? ORDER BY criado_em DESC';
  db.all(sql, [usuario_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ total: rows.length, sermoes: rows });
  });
});

// GET route to retrieve a single sermon by ID
app.get('/sermoes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const sql = 'SELECT * FROM sermoes WHERE id = ? AND usuario_id = ?';
  db.get(sql, [id, usuario_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: 'Sermão não encontrado' });
    }

    res.json(row);
  });
});

// PUT route to update a sermon
app.put('/sermoes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo, data, local } = req.body;
  const usuario_id = req.user.id;

  if (!titulo || !conteudo || !data) {
    return res.status(400).json({ error: 'Título, conteúdo e data são obrigatórios' });
  }

  const sql = 'UPDATE sermoes SET titulo = ?, conteudo = ?, data = ?, local = ? WHERE id = ? AND usuario_id = ?';
  db.run(sql, [titulo, conteudo, data, local || null, id, usuario_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sermão não encontrado' });
    }

    res.json({ message: 'Sermão atualizado com sucesso' });
  });
});

// DELETE route to delete a sermon
app.delete('/sermoes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const sql = 'DELETE FROM sermoes WHERE id = ? AND usuario_id = ?';
  db.run(sql, [id, usuario_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sermão não encontrado' });
    }

    res.json({ message: 'Sermão excluído com sucesso' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;

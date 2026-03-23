const bcrypt = require('bcryptjs');
const db = require('./database');

const username = 'admin';
const password = '123456';

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.error(err);
    return;
  }

  const sql = 'INSERT INTO usuarios (username, password) VALUES (?, ?)';
  db.run(sql, [username, hashedPassword], function(err) {
    if (err) {
      console.error('Erro ao criar usuário:', err.message);
    } else {
      console.log('Usuário criado com ID:', this.lastID);
    }
    db.close();
  });
});
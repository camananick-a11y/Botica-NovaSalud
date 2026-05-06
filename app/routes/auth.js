const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Login page
router.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/menu');
  res.render('login', { error: null });
});

// Login action
router.post('/login', async (req, res) => {
  const { nombre, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT u.*, c.nombre as cargo FROM usuario u JOIN cargo c ON u.id_cargo = c.id_cargo WHERE u.nombre = ?',
      [nombre]
    );
    if (rows.length === 0) {
      return res.render('login', { error: 'Usuario no encontrado' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'Contraseña incorrecta' });
    }
    req.session.user = { id: user.id_usuario, nombre: user.nombre, cargo: user.cargo };
    res.redirect('/menu');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error en el servidor' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;

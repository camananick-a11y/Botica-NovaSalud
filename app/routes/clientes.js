const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Listar clientes
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const [clientes] = await db.query('SELECT * FROM cliente');
    res.render('clientes', { clientes });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar clientes');
  }
});

// Agregar cliente
router.post('/add', async (req, res) => {
  const { nombre } = req.body;
  try {
    await db.query('INSERT INTO cliente (nombre) VALUES (?)', [nombre]);
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.send('Error al agregar cliente');
  }
});

// Eliminar cliente
router.get('/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cliente WHERE id_cliente = ?', [req.params.id]);
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.send('Error al eliminar cliente');
  }
});

module.exports = router;

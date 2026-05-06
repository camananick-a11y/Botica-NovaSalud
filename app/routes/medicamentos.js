const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Listar medicamentos
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const [medicamentos] = await db.query(`
      SELECT m.*, l.nombre as laboratorio, c.nombre as categoria, p.tipo as presentacion
      FROM medicamento m
      JOIN laboratorio l ON m.id_laboratorio = l.id_laboratorio
      JOIN categoria c ON m.id_categoria = c.id_categoria
      JOIN presentacion p ON m.id_presentacion = p.id_presentacion
    `);
    const [laboratorios] = await db.query('SELECT * FROM laboratorio');
    const [categorias] = await db.query('SELECT * FROM categoria');
    const [presentaciones] = await db.query('SELECT * FROM presentacion');
    res.render('medicamentos', { medicamentos, laboratorios, categorias, presentaciones });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar medicamentos');
  }
});

// Agregar medicamento
router.post('/add', async (req, res) => {
  const { nombre, precio, id_laboratorio, id_categoria, id_presentacion } = req.body;
  try {
    await db.query(
      'INSERT INTO medicamento (nombre, precio, id_laboratorio, id_categoria, id_presentacion) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio, id_laboratorio, id_categoria, id_presentacion]
    );
    res.redirect('/medicamentos');
  } catch (err) {
    console.error(err);
    res.send('Error al agregar medicamento');
  }
});

// Eliminar medicamento
router.get('/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM medicamento WHERE id_medicamento = ?', [req.params.id]);
    res.redirect('/medicamentos');
  } catch (err) {
    console.error(err);
    res.send('Error al eliminar medicamento');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// Listar clientes
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const { data: clientes, error } = await supabase.from('cliente').select('*');
    if (error) throw error;
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
    const { error } = await supabase.from('cliente').insert({ nombre });
    if (error) throw error;
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.send('Error al agregar cliente');
  }
});

// Eliminar cliente
router.get('/delete/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('cliente').delete().eq('id_cliente', req.params.id);
    if (error) throw error;
    res.redirect('/clientes');
  } catch (err) {
    console.error(err);
    res.send('Error al eliminar cliente');
  }
});

module.exports = router;

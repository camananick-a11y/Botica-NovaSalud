const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// Listar medicamentos
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const { data: medicamentos, error: medsError } = await supabase
      .from('medicamento')
      .select('*, laboratorio(nombre), categoria(nombre), presentacion(tipo)');
    if (medsError) throw medsError;

    const medicamentosFlat = medicamentos.map((m) => ({
      ...m,
      laboratorio: m.laboratorio?.nombre || null,
      categoria: m.categoria?.nombre || null,
      presentacion: m.presentacion?.tipo || null
    }));

    const { data: laboratorios, error: labError } = await supabase.from('laboratorio').select('*');
    const { data: categorias, error: catError } = await supabase.from('categoria').select('*');
    const { data: presentaciones, error: presError } = await supabase.from('presentacion').select('*');

    if (labError || catError || presError) {
      throw labError || catError || presError;
    }

    res.render('medicamentos', {
      medicamentos: medicamentosFlat,
      laboratorios,
      categorias,
      presentaciones
    });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar medicamentos');
  }
});

// Agregar medicamento
router.post('/add', async (req, res) => {
  const { nombre, precio, id_laboratorio, id_categoria, id_presentacion } = req.body;
  try {
    const { error } = await supabase.from('medicamento').insert({
      nombre,
      precio,
      id_laboratorio,
      id_categoria,
      id_presentacion
    });
    if (error) throw error;
    res.redirect('/medicamentos');
  } catch (err) {
    console.error(err);
    res.send('Error al agregar medicamento');
  }
});

// Eliminar medicamento
router.get('/delete/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('medicamento').delete().eq('id_medicamento', req.params.id);
    if (error) throw error;
    res.redirect('/medicamentos');
  } catch (err) {
    console.error(err);
    res.send('Error al eliminar medicamento');
  }
});

module.exports = router;

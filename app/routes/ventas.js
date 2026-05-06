const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// Página de ventas
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const { data: clientes, error: clientesError } = await supabase.from('cliente').select('*');
    const { data: medicamentos, error: medicamentosError } = await supabase.from('medicamento').select('*');
    if (clientesError || medicamentosError) throw clientesError || medicamentosError;
    res.render('ventas', { clientes, medicamentos });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar ventas');
  }
});

// Procesar venta
router.post('/process', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { id_cliente, tipo, items } = req.body;
  let itemsArray = [];
  try {
    if (typeof items === 'string') {
      itemsArray = JSON.parse(items);
    } else {
      itemsArray = items;
    }
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
      return res.send('No hay items en la venta');
    }

    const id_usuario = req.session.user.id;
    const serie = tipo === 'boleta' ? `B001-${Date.now()}` : `F001-${Date.now()}`;

    const { data: comprobante, error: comprobanteError } = await supabase
      .from('comprobante')
      .insert({ serie, tipo, id_cliente, id_usuario })
      .select()
      .single();

    if (comprobanteError || !comprobante) {
      throw comprobanteError || new Error('No se pudo crear el comprobante');
    }

    const detalleRows = itemsArray.map((item) => ({
      id_comprobante: comprobante.id_comprobante,
      id_medicamento: item.id_medicamento,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario
    }));

    const { error: detalleError } = await supabase.from('detalle_venta').insert(detalleRows);
    if (detalleError) {
      await supabase.from('comprobante').delete().eq('id_comprobante', comprobante.id_comprobante);
      throw detalleError;
    }

    res.redirect(`/comprobante?id=${comprobante.id_comprobante}`);
  } catch (err) {
    console.error(err);
    res.send('Error al procesar venta');
  }
});

module.exports = router;

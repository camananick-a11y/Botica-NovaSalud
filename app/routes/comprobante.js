const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { id } = req.query;
  if (!id) return res.send('ID de comprobante no proporcionado');
  try {
    const { data: comprobanteData, error: comprobanteError } = await supabase
      .from('comprobante')
      .select('*, cliente(nombre), usuario(nombre)')
      .eq('id_comprobante', id)
      .single();

    if (comprobanteError || !comprobanteData) {
      return res.send('Comprobante no encontrado');
    }

    const comprobante = {
      ...comprobanteData,
      cliente: comprobanteData.cliente?.nombre || '',
      usuario: comprobanteData.usuario?.nombre || ''
    };

    const { data: detalles, error: detallesError } = await supabase
      .from('detalle_venta')
      .select('*, medicamento(nombre, presentacion(tipo))')
      .eq('id_comprobante', id);

    if (detallesError) throw detallesError;

    const detallesFlat = detalles.map((item) => ({
      ...item,
      medicamento: item.medicamento?.nombre || '',
      presentacion: item.medicamento?.presentacion?.tipo || ''
    }));

    const total = detallesFlat.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);
    res.render('comprobante', { comprobante, detalles: detallesFlat, total });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar comprobante');
  }
});

module.exports = router;

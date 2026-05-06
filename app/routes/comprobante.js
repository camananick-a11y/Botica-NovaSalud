const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const { id } = req.query;
  if (!id) return res.send('ID de comprobante no proporcionado');
  try {
    const [comprobante] = await db.query(`
      SELECT c.*, cl.nombre as cliente, u.nombre as usuario
      FROM comprobante c
      JOIN cliente cl ON c.id_cliente = cl.id_cliente
      JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_comprobante = ?
    `, [id]);
    if (comprobante.length === 0) return res.send('Comprobante no encontrado');
    const [detalles] = await db.query(`
      SELECT d.*, m.nombre as medicamento, p.tipo as presentacion
      FROM detalle_venta d
      JOIN medicamento m ON d.id_medicamento = m.id_medicamento
      JOIN presentacion p ON m.id_presentacion = p.id_presentacion
      WHERE d.id_comprobante = ?
    `, [id]);
    const total = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    res.render('comprobante', { comprobante: comprobante[0], detalles, total });
  } catch (err) {
    console.error(err);
    res.send('Error al cargar comprobante');
  }
});

module.exports = router;

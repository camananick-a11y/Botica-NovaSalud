const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Página de ventas
router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const [clientes] = await db.query('SELECT * FROM cliente');
    const [medicamentos] = await db.query('SELECT * FROM medicamento');
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
    const conn = await db.getConnection();
    await conn.beginTransaction();
    try {
      const [compResult] = await conn.query(
        'INSERT INTO comprobante (serie, tipo, id_cliente, id_usuario) VALUES (?, ?, ?, ?)',
        [serie, tipo, id_cliente, id_usuario]
      );
      const id_comprobante = compResult.insertId;
      for (const item of itemsArray) {
        await conn.query(
          'INSERT INTO detalle_venta (id_comprobante, id_medicamento, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [id_comprobante, item.id_medicamento, item.cantidad, item.precio_unitario]
        );
      }
      await conn.commit();
      res.redirect(`/comprobante?id=${id_comprobante}`);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.send('Error al procesar venta');
  }
});

module.exports = router;

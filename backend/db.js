const express = require('express');
const cors = require('cors'); // Agregado
const { Pool } = require('pg');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors()); // Ahora cors está definido

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tienda",
  password: "miclave",
  port: 5432,
});

// Endpoint para búsqueda por código de barras
app.get('/api/productos/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await pool.query(
      'SELECT * FROM productos WHERE codigo_barras = $1', 
      [codigo]
    );
    res.json(result.rows[0] || { error: 'Producto no encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para búsqueda por nombre (búsqueda parcial)
app.get('/api/productos/buscar', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await pool.query(
      `SELECT * FROM productos 
       WHERE nombre ILIKE $1 OR codigo_barras ILIKE $1
       LIMIT 10`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para listar todos los productos (inventario)
app.get('/api/productos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM productos ORDER BY nombre LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

// Endpoint para actualizar stock
app.post('/api/productos/update-stock', async (req, res) => {
  try {
    const { codigo_barras, cantidad } = req.body;
    
    // Primero verificar que el producto existe y tiene suficiente stock
    const producto = await pool.query(
      'SELECT * FROM productos WHERE codigo_barras = $1',
      [codigo_barras]
    );
    
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const stockActual = producto.rows[0].stock;
    const nuevoStock = stockActual + cantidad;
    
    if (nuevoStock < 0) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }
    
    // Actualizar el stock
    const result = await pool.query(
      'UPDATE productos SET stock = $1 WHERE codigo_barras = $2 RETURNING *',
      [nuevoStock, codigo_barras]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

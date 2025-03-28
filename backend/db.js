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
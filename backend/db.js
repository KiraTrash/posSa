const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 5000;

// Configuración de middlewares
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuración del pool de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tienda",
  password: process.env.DB_PASSWORD || "miclave",
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('Error crítico en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Middleware de verificación de BD
app.use(async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    next();
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    res.status(503).json({ error: 'Servicio no disponible' });
  }
});

// Helper para manejo de errores
const handleDbError = (err, res) => {
  console.error('Error de base de datos:', err);
  
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Conflicto de datos: registro duplicado' });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Endpoint para búsqueda de productos
app.get('/api/productos/buscar', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'La búsqueda requiere al menos 2 caracteres' });
    }

    const result = await pool.query(`
      SELECT codigo_barras, nombre, precio, stock, categoria
      FROM productos
      WHERE nombre ILIKE $1 OR codigo_barras::TEXT ILIKE $1
      LIMIT 10
    `, [`%${query}%`]);

    res.json(result.rows);
  } catch (err) {
    handleDbError(err, res);
  }
});

// Endpoint para actualizar stock
app.post('/api/productos/update-stock', async (req, res) => {
  let client;
  try {
    const { codigo_barras, cantidad } = req.body;
    
    // Validación
    if (!codigo_barras || isNaN(cantidad)) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    
    // Actualizar stock (restar la cantidad vendida)
    const result = await client.query(
      `UPDATE productos 
       SET stock = stock - $1
       WHERE codigo_barras = $2
       RETURNING codigo_barras, nombre, stock`,
      [Math.abs(cantidad), codigo_barras]
    );

    if (result.rows.length === 0) {
      throw new Error('Producto no encontrado');
    }

    await client.query('COMMIT');
    res.json({ 
      success: true,
      producto: result.rows[0]
    });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    
    console.error('Error al actualizar stock:', err);
    res.status(500).json({ 
      error: 'Error al actualizar el stock',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ==================== ENDPOINTS PARA PRODUCTOS (INVENTARIO) ====================
app.get('/api/productos', async (req, res) => {
  try {
    const simple = req.query.simple === 'true';
    
    // Consulta adaptada a tu estructura de tabla (sin columna "activo")
    let query = `
      SELECT 
        codigo_barras, 
        nombre, 
        precio, 
        stock, 
        categoria,
        fecha_creacion
      FROM productos
    `;

    if (simple) {
      query = `
        SELECT 
          codigo_barras, 
          nombre, 
          precio, 
          stock, 
          categoria
        FROM productos
      `;
    }

    const result = await pool.query(query);
    res.json(simple ? result.rows : { productos: result.rows });
    
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ 
      error: 'Error al cargar el inventario',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/productos', async (req, res) => {
  let client;
  try {
    const { codigo_barras, nombre, precio, stock, categoria } = req.body;
    
    // Validaciones
    if (!codigo_barras || !nombre || !precio || !stock) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO productos 
       (codigo_barras, nombre, precio, stock, categoria)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [codigo_barras, nombre, parseFloat(precio), parseInt(stock), categoria || null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    handleDbError(err, res);
  }
});

// ==================== ENDPOINTS PARA SALIDAS DE EFECTIVO ====================
app.post('/api/salidas', async (req, res) => {
  let client;
  try {
    const { proveedor_nombre, monto, concepto, metodo_pago, registrado_por } = req.body;
    
    // Validación
    const errors = [];
    if (!proveedor_nombre?.trim()) errors.push('El nombre del proveedor es requerido');
    if (!monto) errors.push('El monto es requerido');
    if (isNaN(parseFloat(monto))) errors.push('El monto debe ser un número válido');
    if (parseFloat(monto) <= 0) errors.push('El monto debe ser mayor que cero');
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors
      });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO salidas_efectivo 
       (proveedor_nombre, monto, concepto, metodo_pago, fecha, registrado_por)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING id, proveedor_nombre, monto, fecha, concepto, metodo_pago`,
      [
        proveedor_nombre.trim(),
        parseFloat(monto),
        concepto?.trim() || null,
        metodo_pago || 'efectivo',
        registrado_por || 'sistema'
      ]
    );

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Salida de efectivo registrada exitosamente',
      data: result.rows[0]
    });
    
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    
    console.error('Error en registro de salida:', err);
    
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios',
        details: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al registrar la salida',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/salidas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, proveedor_nombre, monto, concepto, metodo_pago, 
             to_char(fecha, 'DD/MM/YYYY HH24:MI') as fecha
      FROM salidas_efectivo
      ORDER BY fecha DESC
      LIMIT 100
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener salidas:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el historial de salidas'
    });
  }
});

// ==================== ENDPOINTS ADICIONALES ====================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado', path: req.path });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

// Manejo de cierre
process.on('SIGTERM', () => {
  console.log('Recibido SIGTERM. Cerrando servidor...');
  server.close(() => {
    pool.end();
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recibido SIGINT. Cerrando servidor...');
  server.close(() => {
    pool.end();
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = { app, pool };
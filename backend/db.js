const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 5000;

// Configuración mejorada de middlewares con validación de origen
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload
app.use(cors({
  origin: ['http://localhost:3000'], // Solo permite tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuración robusta del pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "tienda",
  password: process.env.DB_PASSWORD || "miclave",
  port: process.env.DB_PORT || 5432,
  max: 20, // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Manejo avanzado de errores de conexión
pool.on('error', (err) => {
  console.error('Error crítico en el pool de PostgreSQL:', err);
  process.exit(-1); // Reiniciar en caso de error crítico
});

// Middleware de verificación de base de datos
app.use(async (req, res, next) => {
  try {
    await pool.query('SELECT 1'); // Prueba de conexión
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

// Endpoint para búsqueda por código de barras con validación mejorada
app.get('/api/productos/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    if (!codigo || codigo.length < 3) {
      return res.status(400).json({ error: 'Código de barras inválido' });
    }

    const result = await pool.query(
      'SELECT codigo_barras, nombre, precio, stock, categoria FROM productos WHERE codigo_barras = $1', 
      [codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
});

// Endpoint para búsqueda general con sanitización
app.get('/api/productos/buscar', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'La búsqueda requiere al menos 2 caracteres válidos' });
    }

    const searchQuery = query.trim().substring(0, 50); // Limitar longitud
    
    const result = await pool.query(
      `SELECT codigo_barras, nombre, precio, stock, categoria 
       FROM productos 
       WHERE nombre ILIKE $1 OR codigo_barras::TEXT LIKE $1
       ORDER BY nombre
       LIMIT 20`,
      [`%${searchQuery}%`]
    );
    
    res.json(result.rows);
  } catch (err) {
    handleDbError(err, res);
  }
});

// Endpoint para inventario con dos modos de respuesta
app.get('/api/productos', async (req, res) => {
  try {
    const { simple, page = 1, limit = 20 } = req.query;
    
    // Modo simple para el frontend
    if (simple) {
      const result = await pool.query(
        `SELECT codigo_barras, nombre, precio, stock, categoria 
         FROM productos 
         ORDER BY nombre`
      );
      return res.json(result.rows);
    }

    // Modo paginado
    const offset = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
    const maxLimit = Math.min(parseInt(limit), 100); // Limitar máximo 100 items

    const [productos, total] = await Promise.all([
      pool.query(
        `SELECT codigo_barras, nombre, precio, stock, categoria 
         FROM productos 
         ORDER BY nombre 
         LIMIT $1 OFFSET $2`,
        [maxLimit, offset]
      ),
      pool.query('SELECT COUNT(*) FROM productos')
    ]);

    res.json({
      productos: productos.rows,
      paginacion: {
        paginaActual: Math.ceil(offset / maxLimit) + 1,
        totalPaginas: Math.ceil(parseInt(total.rows[0].count) / maxLimit),
        totalProductos: parseInt(total.rows[0].count)
      }
    });
    
  } catch (err) {
    handleDbError(err, res);
  }
});

// Endpoint para actualizar stock con validación mejorada
app.post('/api/productos/update-stock', async (req, res) => {
  try {
    const { codigo_barras, cantidad } = req.body;
    
    if (!codigo_barras || cantidad === undefined || isNaN(parseInt(cantidad))) {
      return res.status(400).json({ error: 'Datos de actualización inválidos' });
    }

    await pool.query('BEGIN'); // Iniciar transacción

    const producto = await pool.query(
      'SELECT stock FROM productos WHERE codigo_barras = $1 FOR UPDATE',
      [codigo_barras]
    );
    
    if (producto.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const nuevoStock = producto.rows[0].stock + parseInt(cantidad);
    
    if (nuevoStock < 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Stock no puede ser negativo' });
    }
    
    const result = await pool.query(
      'UPDATE productos SET stock = $1, fecha_actualizacion = NOW() WHERE codigo_barras = $2 RETURNING *',
      [nuevoStock, codigo_barras]
    );
    
    await pool.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    handleDbError(err, res);
  }
});

// Endpoint para crear productos con validación completa
app.post('/api/productos', async (req, res) => {
  try {
    const { codigo_barras, nombre, descripcion, precio, stock, categoria } = req.body;
    
    // Validación estricta
    if (!codigo_barras || !nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios',
        required: ['codigo_barras', 'nombre', 'precio', 'stock']
      });
    }
    
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);
    
    const errors = [];
    if (isNaN(precioNum) || precioNum <= 0) errors.push('Precio inválido');
    if (isNaN(stockNum) || stockNum < 0) errors.push('Stock inválido');
    if (!/^[0-9]{3,20}$/.test(codigo_barras)) errors.push('Código de barras inválido');
    if (nombre.length > 100) errors.push('Nombre demasiado largo');
    
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validación fallida', details: errors });
    }

    await pool.query('BEGIN');
    
    const result = await pool.query(
      `INSERT INTO productos 
       (codigo_barras, nombre, descripcion, precio, stock, categoria, fecha_creacion, fecha_actualizacion)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING codigo_barras, nombre, precio, stock, categoria`,
      [
        codigo_barras.toString(),
        nombre.substring(0, 100),
        descripcion ? descripcion.substring(0, 500) : null,
        precioNum,
        stockNum,
        categoria ? categoria.substring(0, 50) : null
      ]
    );

    await pool.query('COMMIT');
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    await pool.query('ROLLBACK');
    handleDbError(err, res);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado', path: req.path });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor con manejo de errores
const server = app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});

// Manejo de cierre adecuado
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

module.exports = { app, pool }; // Para testing
// Importar dependencias
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

// Crear una instancia de Express
const app = express();
const port = 5000; // Puerto en el que correrá el servidor

// Middleware para permitir CORS (Comunicación entre frontend y backend)
app.use(cors());
app.use(express.json()); // Para parsear JSON en las solicitudes

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: "postgres", // Usuario de PostgreSQL
  host: "localhost", // Host de la base de datos
  database: "tienda", // Nombre de la base de datos
  password: "miclave", // Contraseña de PostgreSQL
  port: 5432, // Puerto de PostgreSQL (por defecto es 5432)
});

// Endpoint para obtener un producto por ID
app.get("/api/productos/:id", async (req, res) => {
  const { id } = req.params; // Obtener el ID del producto desde la URL
  try {
    // Consultar la base de datos
    const result = await pool.query("SELECT * FROM productos WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      // Si se encuentra el producto, devolverlo
      res.json(result.rows[0]);
    } else {
      // Si no se encuentra, devolver un error 404
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (err) {
    // Manejar errores de la base de datos
    console.error(err);
    res.status(500).json({ error: "Error al buscar el producto" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
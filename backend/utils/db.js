require('dotenv').config();
const mysql = require('mysql2');

// Crear pool de conexiones reutilizables usando variables de entorno
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'api_dism',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Comprobar la conexión inicial con la base de datos
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos MySQL:', err.message);
  } else {
    console.log('✅ Conexión con la base de datos MySQL (Pool) establecida con éxito');
    connection.release(); // Liberar conexión de prueba de vuelta al pool
  }
});

module.exports = db;
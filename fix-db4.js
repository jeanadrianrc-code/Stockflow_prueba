const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Iniciando migración de base de datos (Fase 3)...');

// 1. Agregar Costo a Productos
try {
  db.exec('ALTER TABLE Productos ADD COLUMN Costo REAL DEFAULT 0');
  console.log('Columna "Costo" agregada a Productos.');
} catch (e) {
  console.log('La columna "Costo" en Productos ya existe o no se pudo agregar:', e.message);
}

// 2. Agregar Referencia a Abonos
try {
  db.exec('ALTER TABLE Abonos ADD COLUMN Referencia TEXT');
  console.log('Columna "Referencia" agregada a Abonos.');
} catch (e) {
  console.log('La columna "Referencia" en Abonos ya existe o no se pudo agregar:', e.message);
}

// 3. Agregar Comprobante a Abonos
try {
  db.exec('ALTER TABLE Abonos ADD COLUMN Comprobante TEXT');
  console.log('Columna "Comprobante" agregada a Abonos.');
} catch (e) {
  console.log('La columna "Comprobante" en Abonos ya existe o no se pudo agregar:', e.message);
}

console.log('Migración completada exitosamente.');

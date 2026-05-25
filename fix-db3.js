const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Agregando campo Cedula a la tabla Clientes...');

try {
  db.exec('ALTER TABLE Clientes ADD COLUMN Cedula TEXT');
  console.log('Campo Cedula agregado exitosamente.');
} catch (e) {
  console.log('El campo Cedula ya existe o hubo un error:', e.message);
}

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Iniciando corrección de base de datos...');

db.pragma('foreign_keys=off');

db.transaction(() => {
  // 1. Renombrar la tabla vieja
  db.exec('ALTER TABLE Ventas RENAME TO Ventas_old');

  // 2. Crear la tabla nueva sin la restricción de FK que falla
  db.exec(`
    CREATE TABLE Ventas (
      ID_Venta TEXT PRIMARY KEY,
      Fecha TEXT NOT NULL,
      Factura INTEGER NOT NULL,
      Lote TEXT NOT NULL,
      ID_Cliente TEXT NOT NULL,
      Notas TEXT,
      FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente)
    )
  `);

  // 3. Copiar los datos (si hubiera alguno)
  db.exec('INSERT INTO Ventas SELECT * FROM Ventas_old');

  // 4. Borrar la tabla vieja
  db.exec('DROP TABLE Ventas_old');
})();

db.pragma('foreign_keys=on');

console.log('Base de datos corregida con éxito!');

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

console.log('Arreglando referencias residuales en Detalle_Ventas y Abonos...');

db.pragma('foreign_keys=off');

db.transaction(() => {
  // Arreglar Detalle_Ventas
  db.exec('ALTER TABLE Detalle_Ventas RENAME TO Detalle_Ventas_old');
  db.exec(`
    CREATE TABLE Detalle_Ventas (
      ID_DetalleVenta TEXT PRIMARY KEY,
      ID_Venta TEXT NOT NULL,
      ID_Producto TEXT NOT NULL,
      Cantidad INTEGER NOT NULL,
      Precio REAL NOT NULL,
      FOREIGN KEY (ID_Venta) REFERENCES Ventas(ID_Venta),
      FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
    )
  `);
  db.exec('INSERT INTO Detalle_Ventas SELECT * FROM Detalle_Ventas_old');
  db.exec('DROP TABLE Detalle_Ventas_old');

  // Arreglar Abonos
  db.exec('ALTER TABLE Abonos RENAME TO Abonos_old');
  db.exec(`
    CREATE TABLE Abonos (
      ID_Abono TEXT PRIMARY KEY,
      ID_Venta TEXT NOT NULL,
      Fecha TEXT NOT NULL,
      Monto REAL NOT NULL,
      FOREIGN KEY (ID_Venta) REFERENCES Ventas(ID_Venta)
    )
  `);
  db.exec('INSERT INTO Abonos SELECT * FROM Abonos_old');
  db.exec('DROP TABLE Abonos_old');
})();

db.pragma('foreign_keys=on');
console.log('Corrección completada exitosamente.');

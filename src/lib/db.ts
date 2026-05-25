import Database from 'better-sqlite3';
import path from 'path';

// Conexión a la base de datos (se crea el archivo en la raíz del proyecto si no existe)
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Inicializar la base de datos con las tablas requeridas
export function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Productos (
      ID_Producto TEXT PRIMARY KEY,
      Nombre TEXT NOT NULL,
      Precio REAL NOT NULL,
      Costo REAL DEFAULT 0,
      Imagen TEXT,
      Info TEXT
    );

    CREATE TABLE IF NOT EXISTS Clientes (
      ID_Cliente TEXT PRIMARY KEY,
      Nombre TEXT NOT NULL,
      Telefono TEXT,
      Cedula TEXT
    );

    CREATE TABLE IF NOT EXISTS Categorias_Gastos (
      ID_Categoria TEXT PRIMARY KEY,
      Nombre TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Compras (
      ID_Compra TEXT PRIMARY KEY,
      Fecha TEXT NOT NULL,
      Lote TEXT NOT NULL,
      Notas TEXT
    );

    CREATE TABLE IF NOT EXISTS Detalle_Compras (
      ID_DetalleCompra TEXT PRIMARY KEY,
      ID_Compra TEXT NOT NULL,
      ID_Producto TEXT NOT NULL,
      Cantidad INTEGER NOT NULL,
      Precio REAL NOT NULL,
      FOREIGN KEY (ID_Compra) REFERENCES Compras(ID_Compra),
      FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
    );

    CREATE TABLE IF NOT EXISTS Ventas (
      ID_Venta TEXT PRIMARY KEY,
      Fecha TEXT NOT NULL,
      Factura INTEGER NOT NULL,
      Lote TEXT NOT NULL,
      ID_Cliente TEXT NOT NULL,
      Notas TEXT,
      FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente)
    );

    CREATE TABLE IF NOT EXISTS Detalle_Ventas (
      ID_DetalleVenta TEXT PRIMARY KEY,
      ID_Venta TEXT NOT NULL,
      ID_Producto TEXT NOT NULL,
      Cantidad INTEGER NOT NULL,
      Precio REAL NOT NULL,
      FOREIGN KEY (ID_Venta) REFERENCES Ventas(ID_Venta),
      FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
    );

    CREATE TABLE IF NOT EXISTS Abonos (
      ID_Abono TEXT PRIMARY KEY,
      ID_Venta TEXT NOT NULL,
      Fecha TEXT NOT NULL,
      Monto REAL NOT NULL,
      Referencia TEXT,
      Comprobante TEXT,
      FOREIGN KEY (ID_Venta) REFERENCES Ventas(ID_Venta)
    );

    CREATE TABLE IF NOT EXISTS Gastos (
      ID_Gasto TEXT PRIMARY KEY,
      ID_Categoria TEXT NOT NULL,
      Lote TEXT,
      Monto REAL NOT NULL,
      Fecha TEXT NOT NULL,
      Notas TEXT,
      FOREIGN KEY (ID_Categoria) REFERENCES Categorias_Gastos(ID_Categoria)
    );
  `);
}

initializeDB();

export default db;
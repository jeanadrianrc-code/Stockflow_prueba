import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://stockflow-db-jeanadrianrc-code.aws-us-east-2.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not defined');
}

export const client = createClient({
  url: url,
  authToken: authToken,
});

let initPromise: Promise<void> | null = null;

// Inicializar la base de datos con las tablas requeridas
export async function initializeDB() {
  try {
    console.log('Starting DB schema verification/creation...');
    // Creamos todas las tablas en un solo batch para maximizar la velocidad y evitar race conditions
    await client.batch([
      `CREATE TABLE IF NOT EXISTS Productos (
        ID_Producto TEXT PRIMARY KEY,
        Nombre TEXT NOT NULL,
        Precio REAL NOT NULL,
        Costo REAL DEFAULT 0,
        Imagen TEXT,
        Info TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Clientes (
        ID_Cliente TEXT PRIMARY KEY,
        Nombre TEXT NOT NULL,
        Telefono TEXT,
        Cedula TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Categorias_Gastos (
        ID_Categoria TEXT PRIMARY KEY,
        Nombre TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS Compras (
        ID_Compra TEXT PRIMARY KEY,
        Fecha TEXT NOT NULL,
        Lote TEXT NOT NULL,
        Notas TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Detalle_Compras (
        ID_DetalleCompra TEXT PRIMARY KEY,
        ID_Compra TEXT NOT NULL,
        ID_Producto TEXT NOT NULL,
        Cantidad INTEGER NOT NULL,
        Precio REAL NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS Ventas (
        ID_Venta TEXT PRIMARY KEY,
        Fecha TEXT NOT NULL,
        Factura INTEGER NOT NULL,
        Lote TEXT NOT NULL,
        ID_Cliente TEXT NOT NULL,
        Notas TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Detalle_Ventas (
        ID_DetalleVenta TEXT PRIMARY KEY,
        ID_Venta TEXT NOT NULL,
        ID_Producto TEXT NOT NULL,
        Cantidad INTEGER NOT NULL,
        Precio REAL NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS Abonos (
        ID_Abono TEXT PRIMARY KEY,
        ID_Venta TEXT NOT NULL,
        Fecha TEXT NOT NULL,
        Monto REAL NOT NULL,
        Referencia TEXT,
        Comprobante TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS Gastos (
        ID_Gasto TEXT PRIMARY KEY,
        ID_Categoria TEXT NOT NULL,
        Lote TEXT,
        Monto REAL NOT NULL,
        Fecha TEXT NOT NULL,
        Notas TEXT
      );`
    ], "write");
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Garantiza que la DB esté lista antes de hacer cualquier query
export function ensureDbInitialized() {
  if (!initPromise) {
    initPromise = initializeDB();
  }
  return initPromise;
}

// Empezar a inicializar de forma asíncrona en segundo plano inmediatamente
ensureDbInitialized().catch(console.error);

export default client;
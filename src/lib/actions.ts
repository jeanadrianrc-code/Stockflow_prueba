'use server';

import db from './db';
import { revalidatePath } from 'next/cache';

// ===================== PRODUCTOS =====================
export async function getProductos() {
  const stmt = db.prepare(`
    SELECT p.*,
           COALESCE((SELECT SUM(Cantidad) FROM Detalle_Compras WHERE ID_Producto = p.ID_Producto), 0) as Entradas,
           COALESCE((SELECT SUM(Cantidad) FROM Detalle_Ventas WHERE ID_Producto = p.ID_Producto), 0) as Salidas
    FROM Productos p
  `);
  const rows = stmt.all() as any[];
  return rows.map(row => {
    const Stock = row.Entradas - row.Salidas;
    let Estatus = "Revisar";
    if (Stock > 0) Estatus = "Disponible";
    else if (Stock === 0) Estatus = "Agotado";
    return { ...row, Stock, TotalStock: Stock * row.Precio, Estatus };
  });
}

export async function createProducto(formData: FormData) {
  const nombre = formData.get('nombre')?.toString() || '';
  const precio = parseFloat(formData.get('precio')?.toString() || '0');
  const costo = parseFloat(formData.get('costo')?.toString() || '0');
  const imagen = formData.get('imagen')?.toString() || '';
  const info = formData.get('info')?.toString() || '';
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO Productos (ID_Producto, Nombre, Precio, Costo, Imagen, Info) VALUES (?, ?, ?, ?, ?, ?)`).run(id, nombre, precio, costo, imagen, info);
  revalidatePath('/productos');
  revalidatePath('/');
}

export async function updateProducto(id: string, nombre: string, precio: number, costo: number, imagen: string, info: string) {
  db.prepare(`UPDATE Productos SET Nombre=?, Precio=?, Costo=?, Imagen=?, Info=? WHERE ID_Producto=?`).run(nombre, precio, costo, imagen, info, id);
  revalidatePath('/productos');
  revalidatePath('/');
}

export async function deleteProducto(id: string) {
  db.prepare(`DELETE FROM Productos WHERE ID_Producto = ?`).run(id);
  revalidatePath('/productos');
}

// ===================== CLIENTES =====================
export async function getClientes() {
  return db.prepare(`SELECT * FROM Clientes ORDER BY Nombre ASC`).all() as any[];
}

export async function createCliente(nombre: string, telefono: string, cedula: string = '') {
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO Clientes (ID_Cliente, Nombre, Telefono, Cedula) VALUES (?, ?, ?, ?)`).run(id, nombre, telefono, cedula);
  revalidatePath('/clientes');
  revalidatePath('/ventas');
  return { id, nombre, telefono, cedula };
}

export async function deleteCliente(id: string) {
  db.prepare(`DELETE FROM Clientes WHERE ID_Cliente = ?`).run(id);
  revalidatePath('/clientes');
}

// ===================== CATEGORÍAS DE GASTOS =====================
export async function getCategorias() {
  return db.prepare(`SELECT * FROM Categorias_Gastos ORDER BY Nombre ASC`).all() as any[];
}

export async function createCategoria(nombre: string) {
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO Categorias_Gastos (ID_Categoria, Nombre) VALUES (?, ?)`).run(id, nombre);
  revalidatePath('/gastos');
  return { id, nombre };
}

// ===================== COMPRAS =====================
export async function getCompras() {
  const stmt = db.prepare(`
    SELECT c.*,
           COALESCE((SELECT SUM(Cantidad * Precio) FROM Detalle_Compras WHERE ID_Compra = c.ID_Compra), 0) as TotalCompra
    FROM Compras c
    ORDER BY c.Fecha DESC
  `);
  const rows = stmt.all() as any[];

  return rows.map(row => {
    // Total Gastos del Lote
    const gastosRow = db.prepare(`SELECT COALESCE(SUM(Monto), 0) as total FROM Gastos WHERE Lote = ?`).get(row.Lote) as any;
    const totalGastos = gastosRow?.total || 0;

    // Total Ingresos del Lote (abonos de ventas de ese lote)
    const ingresosRow = db.prepare(`
      SELECT COALESCE(SUM(a.Monto), 0) as total 
      FROM Abonos a 
      INNER JOIN Ventas v ON a.ID_Venta = v.ID_Venta 
      WHERE v.Lote = ?
    `).get(row.Lote) as any;
    const totalIngresos = ingresosRow?.total || 0;

    // Total Ventas del Lote (sin depender de abonos, es el total facturado)
    const ventasLoteRow = db.prepare(`
      SELECT COALESCE(SUM(dv.Cantidad * dv.Precio), 0) as total 
      FROM Detalle_Ventas dv 
      INNER JOIN Ventas v ON dv.ID_Venta = v.ID_Venta 
      WHERE v.Lote = ?
    `).get(row.Lote) as any;
    const totalVentasLote = ventasLoteRow?.total || 0;

    const gananciaActual = totalIngresos - (row.TotalCompra + totalGastos);
    const gananciaEsperada = totalVentasLote - (row.TotalCompra + totalGastos);

    return {
      ...row,
      Total: row.TotalCompra,
      TotalGastos: totalGastos,
      TotalIngresos: totalIngresos,
      GananciaActual: gananciaActual,
      GananciaEsperada: gananciaEsperada
    };
  });
}

export async function createCompra(data: { lote: string; notas: string; detalles: { id_producto: string; cantidad: number; precio: number }[] }) {
  const id_compra = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];

  const insertCompra = db.prepare(`INSERT INTO Compras (ID_Compra, Fecha, Lote, Notas) VALUES (?, ?, ?, ?)`);
  const insertDetalle = db.prepare(`INSERT INTO Detalle_Compras (ID_DetalleCompra, ID_Compra, ID_Producto, Cantidad, Precio) VALUES (?, ?, ?, ?, ?)`);

  db.transaction(() => {
    insertCompra.run(id_compra, fecha, data.lote, data.notas);
    for (const item of data.detalles) {
      insertDetalle.run(crypto.randomUUID(), id_compra, item.id_producto, item.cantidad, item.precio);
    }
  })();

  revalidatePath('/compras');
  revalidatePath('/productos');
  revalidatePath('/');
}

// ===================== VENTAS =====================
export async function getVentas() {
  const stmt = db.prepare(`
    SELECT v.*, c.Nombre as ClienteNombre, c.Telefono as ClienteTelefono,
           COALESCE((SELECT SUM(Cantidad * Precio) FROM Detalle_Ventas WHERE ID_Venta = v.ID_Venta), 0) as TotalVenta,
           COALESCE((SELECT SUM(Monto) FROM Abonos WHERE ID_Venta = v.ID_Venta), 0) as Abonos
    FROM Ventas v
    LEFT JOIN Clientes c ON v.ID_Cliente = c.ID_Cliente
    ORDER BY v.Factura DESC
  `);
  const rows = stmt.all() as any[];
  return rows.map(row => {
    const saldo = row.TotalVenta - row.Abonos;
    let estatus = 'Pagado';
    if (saldo > 0 && row.Abonos > 0) estatus = 'Abonado';
    else if (saldo > 0) estatus = 'Pendiente';
    return { ...row, Saldo: saldo, Estatus: estatus };
  });
}

export async function getDetalleVenta(idVenta: string) {
  return db.prepare(`
    SELECT dv.*, p.Nombre as ProductoNombre
    FROM Detalle_Ventas dv
    LEFT JOIN Productos p ON dv.ID_Producto = p.ID_Producto
    WHERE dv.ID_Venta = ?
  `).all(idVenta) as any[];
}

export async function createVenta(data: { id_cliente: string; lote: string; notas: string; detalles: { id_producto: string; cantidad: number; precio: number }[] }) {
  const id_venta = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];

  const maxFacturaRow = db.prepare(`SELECT MAX(Factura) as maxF FROM Ventas`).get() as { maxF: number };
  const factura = (maxFacturaRow?.maxF || 0) + 1;

  const insertVenta = db.prepare(`INSERT INTO Ventas (ID_Venta, Fecha, Factura, Lote, ID_Cliente, Notas) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertDetalle = db.prepare(`INSERT INTO Detalle_Ventas (ID_DetalleVenta, ID_Venta, ID_Producto, Cantidad, Precio) VALUES (?, ?, ?, ?, ?)`);

  let totalCalculado = 0;

  db.transaction(() => {
    insertVenta.run(id_venta, fecha, factura, data.lote, data.id_cliente, data.notas);
    for (const item of data.detalles) {
      insertDetalle.run(crypto.randomUUID(), id_venta, item.id_producto, item.cantidad, item.precio);
      totalCalculado += (item.cantidad * item.precio);
    }
  })();

  revalidatePath('/ventas');
  revalidatePath('/productos');
  revalidatePath('/deudores');
  revalidatePath('/');

  return { id_venta, factura, fecha, total: totalCalculado };
}

// ===================== ABONOS =====================
export async function getAbonosDeVenta(idVenta: string) {
  return db.prepare(`SELECT * FROM Abonos WHERE ID_Venta = ? ORDER BY Fecha DESC`).all(idVenta) as any[];
}

export async function createAbono(idVenta: string, monto: number, referencia: string, comprobante: string) {
  const id = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];
  db.prepare(`INSERT INTO Abonos (ID_Abono, ID_Venta, Fecha, Monto, Referencia, Comprobante) VALUES (?, ?, ?, ?, ?, ?)`).run(id, idVenta, fecha, monto, referencia, comprobante);
  revalidatePath('/deudores');
  revalidatePath('/ventas');
  revalidatePath('/compras');
  revalidatePath('/');
}

// ===================== GASTOS =====================
export async function getGastos() {
  const stmt = db.prepare(`
    SELECT g.*, c.Nombre as CategoriaNombre
    FROM Gastos g
    LEFT JOIN Categorias_Gastos c ON g.ID_Categoria = c.ID_Categoria
    ORDER BY g.Fecha DESC
  `);
  return stmt.all() as any[];
}

export async function createGasto(data: { id_categoria: string; lote: string; monto: number; fecha: string; notas: string }) {
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO Gastos (ID_Gasto, ID_Categoria, Lote, Monto, Fecha, Notas) VALUES (?, ?, ?, ?, ?, ?)`).run(
    id, data.id_categoria, data.lote || null, data.monto, data.fecha, data.notas
  );
  revalidatePath('/gastos');
  revalidatePath('/compras');
  revalidatePath('/');
}

export async function deleteGasto(id: string) {
  db.prepare(`DELETE FROM Gastos WHERE ID_Gasto = ?`).run(id);
  revalidatePath('/gastos');
  revalidatePath('/compras');
  revalidatePath('/');
}

// ===================== REPORTES (Dashboard) =====================
export async function getResumenDashboard() {
  const hoy = new Date().toISOString().split('T')[0];

  const ventasHoyRow = db.prepare(`
    SELECT COALESCE(SUM(dv.Cantidad * dv.Precio), 0) as total
    FROM Detalle_Ventas dv
    INNER JOIN Ventas v ON dv.ID_Venta = v.ID_Venta
    WHERE v.Fecha = ?
  `).get(hoy) as any;

  const cuentasPorCobrarRow = db.prepare(`
    SELECT COALESCE(SUM(
      (SELECT COALESCE(SUM(dv.Cantidad * dv.Precio),0) FROM Detalle_Ventas dv WHERE dv.ID_Venta = v.ID_Venta) 
      - COALESCE((SELECT SUM(a.Monto) FROM Abonos a WHERE a.ID_Venta = v.ID_Venta), 0)
    ), 0) as total
    FROM Ventas v
    WHERE (SELECT COALESCE(SUM(dv2.Cantidad * dv2.Precio),0) FROM Detalle_Ventas dv2 WHERE dv2.ID_Venta = v.ID_Venta) 
      - COALESCE((SELECT SUM(a2.Monto) FROM Abonos a2 WHERE a2.ID_Venta = v.ID_Venta), 0) > 0
  `).get() as any;

  const totalIngresosRow = db.prepare(`SELECT COALESCE(SUM(Monto), 0) as total FROM Abonos`).get() as any;
  const totalComprasRow = db.prepare(`SELECT COALESCE(SUM(Cantidad * Precio), 0) as total FROM Detalle_Compras`).get() as any;
  const totalGastosRow = db.prepare(`SELECT COALESCE(SUM(Monto), 0) as total FROM Gastos`).get() as any;

  const utilidad = (totalIngresosRow?.total || 0) - (totalComprasRow?.total || 0) - (totalGastosRow?.total || 0);

  return {
    ventasDelDia: ventasHoyRow?.total || 0,
    cuentasPorCobrar: cuentasPorCobrarRow?.total || 0,
    totalIngresos: totalIngresosRow?.total || 0,
    totalCompras: totalComprasRow?.total || 0,
    totalGastos: totalGastosRow?.total || 0,
    utilidad
  };
}

'use server';

import db, { ensureDbInitialized } from './db';
import { revalidatePath } from 'next/cache';

// ===================== PRODUCTOS =====================
export async function getProductos() {
  await ensureDbInitialized();
  const result = await db.execute(`
    SELECT p.*,
           COALESCE((SELECT SUM(Cantidad) FROM Detalle_Compras WHERE ID_Producto = p.ID_Producto), 0) as Entradas,
           COALESCE((SELECT SUM(Cantidad) FROM Detalle_Ventas WHERE ID_Producto = p.ID_Producto), 0) as Salidas
    FROM Productos p
  `);
  return result.rows.map(row => {
    const entradas = Number(row.Entradas);
    const salidas = Number(row.Salidas);
    const precio = Number(row.Precio);
    const Stock = entradas - salidas;
    let Estatus = "Revisar";
    if (Stock > 0) Estatus = "Disponible";
    else if (Stock === 0) Estatus = "Agotado";
    return {
      ID_Producto: String(row.ID_Producto),
      Nombre: String(row.Nombre),
      Precio: precio,
      Costo: Number(row.Costo || 0),
      Imagen: row.Imagen ? String(row.Imagen) : null,
      Info: row.Info ? String(row.Info) : null,
      Entradas: entradas,
      Salidas: salidas,
      Stock,
      TotalStock: Stock * precio,
      Estatus
    };
  });
}

export async function createProducto(formData: FormData) {
  await ensureDbInitialized();
  const nombre = formData.get('nombre')?.toString() || '';
  const precio = parseFloat(formData.get('precio')?.toString() || '0');
  const costo = parseFloat(formData.get('costo')?.toString() || '0');
  const imagen = formData.get('imagen')?.toString() || '';
  const info = formData.get('info')?.toString() || '';
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO Productos (ID_Producto, Nombre, Precio, Costo, Imagen, Info) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, nombre, precio, costo, imagen, info]
  });
  revalidatePath('/productos');
  revalidatePath('/');
}

export async function updateProducto(id: string, nombre: string, precio: number, costo: number, imagen: string, info: string) {
  await ensureDbInitialized();
  await db.execute({
    sql: `UPDATE Productos SET Nombre=?, Precio=?, Costo=?, Imagen=?, Info=? WHERE ID_Producto=?`,
    args: [nombre, precio, costo, imagen, info, id]
  });
  revalidatePath('/productos');
  revalidatePath('/');
}

export async function deleteProducto(id: string) {
  await ensureDbInitialized();
  await db.execute({
    sql: `DELETE FROM Productos WHERE ID_Producto = ?`,
    args: [id]
  });
  revalidatePath('/productos');
}

// ===================== CLIENTES =====================
export async function getClientes() {
  await ensureDbInitialized();
  const result = await db.execute(`SELECT * FROM Clientes ORDER BY Nombre ASC`);
  return result.rows.map(row => ({
    ID_Cliente: String(row.ID_Cliente),
    Nombre: String(row.Nombre),
    Telefono: row.Telefono ? String(row.Telefono) : '',
    Cedula: row.Cedula ? String(row.Cedula) : ''
  }));
}

export async function createCliente(nombre: string, telefono: string, cedula: string = '') {
  await ensureDbInitialized();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO Clientes (ID_Cliente, Nombre, Telefono, Cedula) VALUES (?, ?, ?, ?)`,
    args: [id, nombre, telefono, cedula]
  });
  revalidatePath('/clientes');
  revalidatePath('/ventas');
  return { id, nombre, telefono, cedula };
}

export async function deleteCliente(id: string) {
  await ensureDbInitialized();
  await db.execute({
    sql: `DELETE FROM Clientes WHERE ID_Cliente = ?`,
    args: [id]
  });
  revalidatePath('/clientes');
}

// ===================== CATEGORÍAS DE GASTOS =====================
export async function getCategorias() {
  await ensureDbInitialized();
  const result = await db.execute(`SELECT * FROM Categorias_Gastos ORDER BY Nombre ASC`);
  return result.rows.map(row => ({
    ID_Categoria: String(row.ID_Categoria),
    Nombre: String(row.Nombre)
  }));
}

export async function createCategoria(nombre: string) {
  await ensureDbInitialized();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO Categorias_Gastos (ID_Categoria, Nombre) VALUES (?, ?)`,
    args: [id, nombre]
  });
  revalidatePath('/gastos');
  return { id, name: nombre };
}

// ===================== COMPRAS =====================
export async function getCompras() {
  await ensureDbInitialized();
  const result = await db.execute(`
    SELECT c.*,
           COALESCE((SELECT SUM(Cantidad * Precio) FROM Detalle_Compras WHERE ID_Compra = c.ID_Compra), 0) as TotalCompra
    FROM Compras c
    ORDER BY c.Fecha DESC
  `);
  
  const mapped = await Promise.all(result.rows.map(async (row) => {
    const lote = String(row.Lote);
    const totalCompra = Number(row.TotalCompra);
    
    // Ejecutar las subconsultas en paralelo para esta compra
    const [gastosRes, ingresosRes, ventasLoteRes] = await Promise.all([
      db.execute({
        sql: `SELECT COALESCE(SUM(Monto), 0) as total FROM Gastos WHERE Lote = ?`,
        args: [lote]
      }),
      db.execute({
        sql: `
          SELECT COALESCE(SUM(a.Monto), 0) as total 
          FROM Abonos a 
          INNER JOIN Ventas v ON a.ID_Venta = v.ID_Venta 
          WHERE v.Lote = ?
        `,
        args: [lote]
      }),
      db.execute({
        sql: `
          SELECT COALESCE(SUM(dv.Cantidad * dv.Precio), 0) as total 
          FROM Detalle_Ventas dv 
          INNER JOIN Ventas v ON dv.ID_Venta = v.ID_Venta 
          WHERE v.Lote = ?
        `,
        args: [lote]
      })
    ]);

    const totalGastos = Number(gastosRes.rows[0]?.total || 0);
    const totalIngresos = Number(ingresosRes.rows[0]?.total || 0);
    const totalVentasLote = Number(ventasLoteRes.rows[0]?.total || 0);

    const gananciaActual = totalIngresos - (totalCompra + totalGastos);
    const gananciaEsperada = totalVentasLote - (totalCompra + totalGastos);

    return {
      ID_Compra: String(row.ID_Compra),
      Fecha: String(row.Fecha),
      Lote: lote,
      Notas: row.Notas ? String(row.Notas) : '',
      Total: totalCompra,
      TotalGastos: totalGastos,
      TotalIngresos: totalIngresos,
      GananciaActual: gananciaActual,
      GananciaEsperada: gananciaEsperada
    };
  }));
  
  return mapped;
}

export async function createCompra(data: { lote: string; notas: string; detalles: { id_producto: string; cantidad: number; precio: number }[] }) {
  await ensureDbInitialized();
  const id_compra = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];

  const statements: any[] = [
    {
      sql: `INSERT INTO Compras (ID_Compra, Fecha, Lote, Notas) VALUES (?, ?, ?, ?)`,
      args: [id_compra, fecha, data.lote, data.notas]
    }
  ];

  for (const item of data.detalles) {
    statements.push({
      sql: `INSERT INTO Detalle_Compras (ID_DetalleCompra, ID_Compra, ID_Producto, Cantidad, Precio) VALUES (?, ?, ?, ?, ?)`,
      args: [crypto.randomUUID(), id_compra, item.id_producto, item.cantidad, item.precio]
    });
  }

  await db.batch(statements, "write");

  revalidatePath('/compras');
  revalidatePath('/productos');
  revalidatePath('/');
}

// ===================== VENTAS =====================
export async function getVentas() {
  await ensureDbInitialized();
  const result = await db.execute(`
    SELECT v.*, c.Nombre as ClienteNombre, c.Telefono as ClienteTelefono,
           COALESCE((SELECT SUM(Cantidad * Precio) FROM Detalle_Ventas WHERE ID_Venta = v.ID_Venta), 0) as TotalVenta,
           COALESCE((SELECT SUM(Monto) FROM Abonos WHERE ID_Venta = v.ID_Venta), 0) as Abonos
    FROM Ventas v
    LEFT JOIN Clientes c ON v.ID_Cliente = c.ID_Cliente
    ORDER BY v.Factura DESC
  `);
  return result.rows.map(row => {
    const totalVenta = Number(row.TotalVenta);
    const abonos = Number(row.Abonos);
    const saldo = totalVenta - abonos;
    let estatus = 'Pagado';
    if (saldo > 0 && abonos > 0) estatus = 'Abonado';
    else if (saldo > 0) estatus = 'Pendiente';
    return {
      ID_Venta: String(row.ID_Venta),
      Fecha: String(row.Fecha),
      Factura: Number(row.Factura),
      Lote: String(row.Lote),
      ID_Cliente: String(row.ID_Cliente),
      Notas: row.Notas ? String(row.Notas) : '',
      ClienteNombre: row.ClienteNombre ? String(row.ClienteNombre) : 'Consumidor Final',
      ClienteTelefono: row.ClienteTelefono ? String(row.ClienteTelefono) : '',
      TotalVenta: totalVenta,
      Abonos: abonos,
      Saldo: saldo,
      Estatus: estatus
    };
  });
}

export async function getDetalleVenta(idVenta: string) {
  await ensureDbInitialized();
  const result = await db.execute({
    sql: `
      SELECT dv.*, p.Nombre as ProductoNombre
      FROM Detalle_Ventas dv
      LEFT JOIN Productos p ON dv.ID_Producto = p.ID_Producto
      WHERE dv.ID_Venta = ?
    `,
    args: [idVenta]
  });
  return result.rows.map(row => ({
    ID_DetalleVenta: String(row.ID_DetalleVenta),
    ID_Venta: String(row.ID_Venta),
    ID_Producto: String(row.ID_Producto),
    Cantidad: Number(row.Cantidad),
    Precio: Number(row.Precio),
    ProductoNombre: row.ProductoNombre ? String(row.ProductoNombre) : 'Producto no encontrado'
  }));
}

export async function createVenta(data: { id_cliente: string; lote: string; notas: string; detalles: { id_producto: string; cantidad: number; precio: number }[] }) {
  await ensureDbInitialized();
  const id_venta = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];

  const maxFacturaRes = await db.execute(`SELECT MAX(Factura) as maxF FROM Ventas`);
  const factura = Number(maxFacturaRes.rows[0]?.maxF || 0) + 1;

  const statements: any[] = [
    {
      sql: `INSERT INTO Ventas (ID_Venta, Fecha, Factura, Lote, ID_Cliente, Notas) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id_venta, fecha, factura, data.lote, data.id_cliente, data.notas]
    }
  ];

  let totalCalculado = 0;
  for (const item of data.detalles) {
    statements.push({
      sql: `INSERT INTO Detalle_Ventas (ID_DetalleVenta, ID_Venta, ID_Producto, Cantidad, Precio) VALUES (?, ?, ?, ?, ?)`,
      args: [crypto.randomUUID(), id_venta, item.id_producto, item.cantidad, item.precio]
    });
    totalCalculado += (item.cantidad * item.precio);
  }

  await db.batch(statements, "write");

  revalidatePath('/ventas');
  revalidatePath('/productos');
  revalidatePath('/deudores');
  revalidatePath('/');

  return { id_venta, factura, fecha, total: totalCalculado };
}

// ===================== ABONOS =====================
export async function getAbonosDeVenta(idVenta: string) {
  await ensureDbInitialized();
  const result = await db.execute({
    sql: `SELECT * FROM Abonos WHERE ID_Venta = ? ORDER BY Fecha DESC`,
    args: [idVenta]
  });
  return result.rows.map(row => ({
    ID_Abono: String(row.ID_Abono),
    ID_Venta: String(row.ID_Venta),
    Fecha: String(row.Fecha),
    Monto: Number(row.Monto),
    Referencia: row.Referencia ? String(row.Referencia) : '',
    Comprobante: row.Comprobante ? String(row.Comprobante) : ''
  }));
}

export async function createAbono(idVenta: string, monto: number, referencia: string, comprobante: string) {
  await ensureDbInitialized();
  const id = crypto.randomUUID();
  const fecha = new Date().toISOString().split('T')[0];
  await db.execute({
    sql: `INSERT INTO Abonos (ID_Abono, ID_Venta, Fecha, Monto, Referencia, Comprobante) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, idVenta, fecha, monto, referencia, comprobante]
  });
  revalidatePath('/deudores');
  revalidatePath('/ventas');
  revalidatePath('/compras');
  revalidatePath('/');
}

// ===================== GASTOS =====================
export async function getGastos() {
  await ensureDbInitialized();
  const result = await db.execute(`
    SELECT g.*, c.Nombre as CategoriaNombre
    FROM Gastos g
    LEFT JOIN Categorias_Gastos c ON g.ID_Categoria = c.ID_Categoria
    ORDER BY g.Fecha DESC
  `);
  return result.rows.map(row => ({
    ID_Gasto: String(row.ID_Gasto),
    ID_Categoria: String(row.ID_Categoria),
    Lote: row.Lote ? String(row.Lote) : '',
    Monto: Number(row.Monto),
    Fecha: String(row.Fecha),
    Notas: row.Notas ? String(row.Notas) : '',
    CategoriaNombre: row.CategoriaNombre ? String(row.CategoriaNombre) : 'Sin categoría'
  }));
}

export async function createGasto(data: { id_categoria: string; lote: string; monto: number; fecha: string; notas: string }) {
  await ensureDbInitialized();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO Gastos (ID_Gasto, ID_Categoria, Lote, Monto, Fecha, Notas) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, data.id_categoria, data.lote || null, data.monto, data.fecha, data.notas]
  });
  revalidatePath('/gastos');
  revalidatePath('/compras');
  revalidatePath('/');
}

export async function deleteGasto(id: string) {
  await ensureDbInitialized();
  await db.execute({
    sql: `DELETE FROM Gastos WHERE ID_Gasto = ?`,
    args: [id]
  });
  revalidatePath('/gastos');
  revalidatePath('/compras');
  revalidatePath('/');
}

// ===================== REPORTES (Dashboard) =====================
export async function getResumenDashboard() {
  await ensureDbInitialized();
  const hoy = new Date().toISOString().split('T')[0];

  const [
    ventasHoyRes,
    cuentasPorCobrarRes,
    totalIngresosRes,
    totalComprasRes,
    totalGastosRes
  ] = await Promise.all([
    db.execute({
      sql: `
        SELECT COALESCE(SUM(dv.Cantidad * dv.Precio), 0) as total
        FROM Detalle_Ventas dv
        INNER JOIN Ventas v ON dv.ID_Venta = v.ID_Venta
        WHERE v.Fecha = ?
      `,
      args: [hoy]
    }),
    db.execute(`
      SELECT COALESCE(SUM(
        (SELECT COALESCE(SUM(dv.Cantidad * dv.Precio),0) FROM Detalle_Ventas dv WHERE dv.ID_Venta = v.ID_Venta) 
        - COALESCE((SELECT SUM(a.Monto) FROM Abonos a WHERE a.ID_Venta = v.ID_Venta), 0)
      ), 0) as total
      FROM Ventas v
      WHERE (SELECT COALESCE(SUM(dv2.Cantidad * dv2.Precio),0) FROM Detalle_Ventas dv2 WHERE dv2.ID_Venta = v.ID_Venta) 
        - COALESCE((SELECT SUM(a2.Monto) FROM Abonos a2 WHERE a2.ID_Venta = v.ID_Venta), 0) > 0
    `),
    db.execute(`SELECT COALESCE(SUM(Monto), 0) as total FROM Abonos`),
    db.execute(`SELECT COALESCE(SUM(Cantidad * Precio), 0) as total FROM Detalle_Compras`),
    db.execute(`SELECT COALESCE(SUM(Monto), 0) as total FROM Gastos`)
  ]);

  const ventasDelDia = Number(ventasHoyRes.rows[0]?.total || 0);
  const cuentasPorCobrar = Number(cuentasPorCobrarRes.rows[0]?.total || 0);
  const totalIngresos = Number(totalIngresosRes.rows[0]?.total || 0);
  const totalCompras = Number(totalComprasRes.rows[0]?.total || 0);
  const totalGastos = Number(totalGastosRes.rows[0]?.total || 0);

  const utilidad = totalIngresos - totalCompras - totalGastos;

  return {
    ventasDelDia,
    cuentasPorCobrar,
    totalIngresos,
    totalCompras,
    totalGastos,
    utilidad
  };
}

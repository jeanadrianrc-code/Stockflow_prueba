'use client';

import { useState } from 'react';
import { createVenta, createCliente } from '@/lib/actions';
import { Plus, CheckCircle, Printer, PlusCircle, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function FormularioVenta({ productos, clientes, compras }: { productos: any[], clientes: any[], compras: any[] }) {
  const [idCliente, setIdCliente] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [cedulaCliente, setCedulaCliente] = useState('');
  const [modoNuevoCliente, setModoNuevoCliente] = useState(false);
  
  const [lote, setLote] = useState('');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<{ id_producto: string; cantidad: number; precio: number }[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(0);
  const [costoSeleccionado, setCostoSeleccionado] = useState<number>(0);

  const [procesando, setProcesando] = useState(false);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProduct(id);
    const prod = productos.find(p => p.ID_Producto === id);
    if (prod) {
      setPrecio(prod.Precio);
      setCostoSeleccionado(prod.Costo || 0);
    } else {
      setPrecio(0);
      setCostoSeleccionado(0);
    }
  };

  const aplicarMargen = () => {
    if (costoSeleccionado > 0) {
      const precioConMargen = costoSeleccionado * 1.25;
      setPrecio(parseFloat(precioConMargen.toFixed(2)));
    }
  };

  const agregarDetalle = () => {
    if (!selectedProduct) return alert('Seleccione un producto');
    if (cantidad <= 0) return alert('La cantidad debe ser mayor a 0');
    
    // Validar Stock
    const prod = productos.find(p => p.ID_Producto === selectedProduct);
    if (prod && cantidad > prod.Stock) {
      return alert(`Solo hay ${prod.Stock} unidades disponibles de ${prod.Nombre}`);
    }

    const existente = detalles.find(d => d.id_producto === selectedProduct);
    if (existente) {
      if (existente.cantidad + cantidad > (prod?.Stock || 0)) {
         return alert(`Supera el stock disponible (${prod?.Stock})`);
      }
      setDetalles(detalles.map(d => 
        d.id_producto === selectedProduct ? { ...d, cantidad: d.cantidad + cantidad, precio } : d
      ));
    } else {
      setDetalles([...detalles, { id_producto: selectedProduct, cantidad, precio }]);
    }
    
    setSelectedProduct('');
    setCantidad(1);
    setPrecio(0);
    setCostoSeleccionado(0);
  };

  const generarPDF = (facturaNum: number, fecha: string, clienteNombre: string, clienteTel: string, clienteCedula: string, loteStr: string, total: number) => {
    const doc = new jsPDF();
    doc.setFontSize(10);
    let y = 15;
    
    doc.setFont("courier", "bold");
    doc.text("=====================================================", 15, y); y += 6;
    doc.text(`                 FACTURA DE VENTA N° ${facturaNum}`, 15, y); y += 6;
    doc.text("=====================================================", 15, y); y += 10;
    
    doc.setFont("courier", "normal");
    doc.text(`Fecha: ${fecha}`, 15, y); y += 6;
    doc.text(`Cliente: ${clienteNombre}`, 15, y); y += 6;
    doc.text(`Cédula/ID: ${clienteCedula || 'N/A'}`, 15, y); y += 6;
    doc.text(`Teléfono: ${clienteTel || 'N/A'}`, 15, y); y += 6;
    doc.text(`Lote de Compra: ${loteStr}`, 15, y); y += 6;
    
    doc.text("-----------------------------------------------------", 15, y); y += 6;
    doc.setFont("courier", "bold");
    doc.text("DETALLE DE PRODUCTOS:", 15, y); y += 8;
    doc.setFont("courier", "normal");
    
    detalles.forEach(d => {
      const p = productos.find(x => x.ID_Producto === d.id_producto);
      const nombre = p?.Nombre.padEnd(20, ' ').substring(0, 20) || '';
      const totalItem = (d.cantidad * d.precio).toFixed(2);
      
      doc.text(`- ${nombre} | Cant: ${d.cantidad} | P.U: $${d.precio.toFixed(2)} | Total: $${totalItem}`, 15, y);
      y += 6;
    });

    doc.text("-----------------------------------------------------", 15, y); y += 6;
    doc.setFont("courier", "bold");
    doc.text(`TOTAL FACTURA: $${total.toFixed(2)}`, 15, y); y += 6;
    doc.text(`TOTAL ABONADO: $0.00`, 15, y); y += 6;
    doc.text(`SALDO RESTANTE: $${total.toFixed(2)}`, 15, y); y += 6;
    doc.text("=====================================================", 15, y);
    
    doc.save(`Factura_${facturaNum}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detalles.length === 0) return alert('Añade productos a la venta.');
    
    setProcesando(true);
    let id_cliente_final = idCliente;
    let nombreC = '';
    let telC = '';
    let cedulaC = '';

    if (modoNuevoCliente) {
      if (!nuevoCliente) { setProcesando(false); return alert('Ingrese el nombre del cliente'); }
      const res = await createCliente(nuevoCliente, telefonoCliente, cedulaCliente);
      id_cliente_final = res.id;
      nombreC = res.nombre;
      telC = res.telefono;
      cedulaC = res.cedula;
    } else {
      if (!idCliente) { setProcesando(false); return alert('Seleccione un cliente'); }
      const c = clientes.find(x => x.ID_Cliente === idCliente);
      if (c) { 
        nombreC = c.Nombre; 
        telC = c.Telefono;
        cedulaC = c.Cedula;
      }
    }

    const resultado = await createVenta({ id_cliente: id_cliente_final, lote: lote || 'N/A', notas, detalles });
    
    generarPDF(resultado.factura, resultado.fecha, nombreC, telC, cedulaC, lote || 'N/A', resultado.total);

    alert('Venta procesada con éxito y Factura descargada.');
    setDetalles([]);
    setLote('');
    setNotas('');
    setIdCliente('');
    setModoNuevoCliente(false);
    setProcesando(false);
    setCedulaCliente('');
    setTelefonoCliente('');
    setNuevoCliente('');
  };

  const totalCompra = detalles.reduce((acc, curr) => acc + (curr.cantidad * curr.precio), 0);

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Nueva Factura / Venta</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Sección Cliente */}
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>Datos del Cliente</h3>
            <button type="button" onClick={() => setModoNuevoCliente(!modoNuevoCliente)} className="text-xs font-bold text-blue-500 hover:text-blue-400">
              {modoNuevoCliente ? "Usar Cliente Existente" : "+ Nuevo Cliente"}
            </button>
          </div>
          
          {modoNuevoCliente ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group mb-0">
                <label>Cédula / RIF</label>
                <input type="text" value={cedulaCliente} onChange={e => setCedulaCliente(e.target.value)} className="form-control" placeholder="V-12345678" />
              </div>
              <div className="form-group mb-0">
                <label>Nombre *</label>
                <input type="text" value={nuevoCliente} onChange={e => setNuevoCliente(e.target.value)} className="form-control" placeholder="Juan Pérez" />
              </div>
              <div className="form-group mb-0">
                <label>Teléfono</label>
                <input type="text" value={telefonoCliente} onChange={e => setTelefonoCliente(e.target.value)} className="form-control" placeholder="0414-0000000" />
              </div>
            </div>
          ) : (
            <div className="form-group mb-0">
              <label>Seleccionar Cliente *</label>
              <select value={idCliente} onChange={e => setIdCliente(e.target.value)} className="form-control" style={{ WebkitAppearance: 'none' }}>
                <option value="">Seleccione...</option>
                {clientes.map(c => (
                  <option key={c.ID_Cliente} value={c.ID_Cliente}>
                    {c.Nombre} {c.Cedula ? `(C.I: ${c.Cedula})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sección Referencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group mb-0">
            <label>Lote asociado (Opcional)</label>
            <select value={lote} onChange={e => setLote(e.target.value)} className="form-control" style={{ WebkitAppearance: 'none' }}>
              <option value="">Sin lote específico</option>
              {compras.map(c => (
                <option key={c.Lote} value={c.Lote}>{c.Lote} ({c.Fecha})</option>
              ))}
            </select>
          </div>
          <div className="form-group mb-0">
            <label>Notas Adicionales</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)} className="form-control" />
          </div>
        </div>

        {/* Añadir Productos */}
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border-color)' }}>
          <div className="grid grid-cols-1 gap-4">
            <div className="form-group mb-0">
              <label>Producto a Vender</label>
              <select value={selectedProduct} onChange={handleProductChange} className="form-control" style={{ WebkitAppearance: 'none' }}>
                <option value="">Buscar en Inventario...</option>
                {productos.filter(p => p.Stock > 0).map(p => (
                  <option key={p.ID_Producto} value={p.ID_Producto}>{p.Nombre} (Disp: {p.Stock})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label>Cant.</label>
                <input type="number" min="1" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="form-control" />
              </div>
              <div className="form-group mb-0">
                <label>P. Unitario</label>
                <input type="number" step="0.01" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="form-control" />
              </div>
            </div>
          </div>

          {/* Ayudante de Margen del 25% */}
          {selectedProduct && costoSeleccionado > 0 && (
            <div className="mt-3 flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Costo compra base: <strong style={{ color: 'var(--text-main)' }}>${costoSeleccionado.toFixed(2)}</strong>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sugerido (+25% margen): <strong style={{ color: 'var(--success)' }}>${(costoSeleccionado * 1.25).toFixed(2)}</strong>
                </p>
              </div>
              <button type="button" onClick={aplicarMargen} className="btn text-xs py-1 px-3" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>
                <TrendingUp size={14} /> Aplicar +25% Ganancia
              </button>
            </div>
          )}

          <button type="button" onClick={agregarDetalle} className="btn w-full mt-4" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
            <PlusCircle size={16} /> Agregar a Factura
          </button>
        </div>

        {detalles.length > 0 && (
          <div className="mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Cant.</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(d => {
                  const prod = productos.find(p => p.ID_Producto === d.id_producto);
                  return (
                    <tr key={d.id_producto}>
                      <td style={{ color: 'var(--text-main)' }}>{prod?.Nombre}</td>
                      <td>{d.cantidad}</td>
                      <td className="font-bold text-green-500">${(d.cantidad * d.precio).toFixed(2)}</td>
                      <td className="text-right">
                        <button type="button" onClick={() => setDetalles(detalles.filter(x => x.id_producto !== d.id_producto))} className="text-red-500">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-right mt-4 flex justify-end gap-4 items-center">
              <span style={{ color: 'var(--text-muted)' }}>Total Venta:</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>${totalCompra.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={detalles.length === 0 || procesando} className="btn btn-primary w-full mt-2">
          {procesando ? 'Procesando...' : <><Printer size={18} /> Confirmar e Imprimir PDF</>}
        </button>
      </form>
    </div>
  );
}

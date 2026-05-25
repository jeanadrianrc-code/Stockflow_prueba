'use client';

import { useState } from 'react';
import { createCompra } from '@/lib/actions';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';

export default function FormularioCompra({ productos }: { productos: any[] }) {
  const [lote, setLote] = useState('');
  const [notas, setNotas] = useState('');
  const [detalles, setDetalles] = useState<{ id_producto: string; cantidad: number; precio: number }[]>([]);
  
  // Variables temporales para agregar un nuevo ítem al carrito de compra
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState<number>(10);
  const [precio, setPrecio] = useState<number>(0);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProduct(id);
    const prod = productos.find(p => p.ID_Producto === id);
    if (prod) {
      setPrecio(prod.Precio); // Por defecto el precio actual, pero es editable
    } else {
      setPrecio(0);
    }
  };

  const agregarDetalle = () => {
    if (!selectedProduct) return alert('Seleccione un producto');
    if (cantidad <= 0 || cantidad % 10 !== 0) return alert('La cantidad debe ser un múltiplo de 10 (ej. 10, 20, 30)');
    
    // Evitar duplicados (sumar cantidad si ya existe)
    const existente = detalles.find(d => d.id_producto === selectedProduct);
    if (existente) {
      setDetalles(detalles.map(d => 
        d.id_producto === selectedProduct 
          ? { ...d, cantidad: d.cantidad + cantidad, precio } 
          : d
      ));
    } else {
      setDetalles([...detalles, { id_producto: selectedProduct, cantidad, precio }]);
    }
    
    // Resetear formulario parcial
    setSelectedProduct('');
    setCantidad(10);
    setPrecio(0);
  };

  const eliminarDetalle = (id: string) => {
    setDetalles(detalles.filter(d => d.id_producto !== id));
  };

  const totalCompra = detalles.reduce((acc, curr) => acc + (curr.cantidad * curr.precio), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lote) return alert('El Lote es obligatorio.');
    if (detalles.length === 0) return alert('Debe agregar al menos un producto a la compra.');

    await createCompra({ lote, notas, detalles });
    
    // Limpiar formulario total
    setLote('');
    setNotas('');
    setDetalles([]);
    alert('Compra registrada exitosamente.');
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Registrar Nueva Compra</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group mb-0">
            <label>Lote / Identificador de Compra</label>
            <input type="text" value={lote} onChange={e => setLote(e.target.value)} required className="form-control" placeholder="Ej. LOTE-001" />
          </div>
          <div className="form-group mb-0">
            <label>Notas (Opcional)</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)} className="form-control" placeholder="Proveedor, condiciones..." />
          </div>
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-color)', border: '1px dashed var(--border-color)' }}>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Agregar Producto a la Orden</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="form-group mb-0">
              <label>Producto</label>
              <select value={selectedProduct} onChange={handleProductChange} className="form-control" style={{ WebkitAppearance: 'none' }}>
                <option value="">Seleccione...</option>
                {productos.map(p => (
                  <option key={p.ID_Producto} value={p.ID_Producto}>{p.Nombre} (Stock: {p.Stock})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label>Cantidad (Múltiplos de 10)</label>
                <input type="number" step="10" min="10" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="form-control" />
              </div>
              <div className="form-group mb-0">
                <label>Precio de Compra</label>
                <input type="number" step="0.01" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="form-control" />
              </div>
            </div>
          </div>
          <button type="button" onClick={agregarDetalle} className="btn w-full mt-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
            <Plus size={16} /> Añadir a la lista
          </button>
        </div>

        {detalles.length > 0 && (
          <div className="mb-4">
            <table className="text-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>P. Unit</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map(d => {
                  const prod = productos.find(p => p.ID_Producto === d.id_producto);
                  return (
                    <tr key={d.id_producto}>
                      <td className="font-medium" style={{ color: 'var(--text-main)' }}>{prod?.Nombre}</td>
                      <td>{d.cantidad}</td>
                      <td>${d.precio.toFixed(2)}</td>
                      <td className="font-bold text-blue-500">${(d.cantidad * d.precio).toFixed(2)}</td>
                      <td className="text-right">
                        <button type="button" onClick={() => eliminarDetalle(d.id_producto)} className="text-red-500 p-1 rounded-full hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-right mt-4 flex justify-end gap-4 items-center">
              <span style={{ color: 'var(--text-muted)' }}>Total Compra:</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>${totalCompra.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={detalles.length === 0} className="btn btn-primary w-full mt-2" style={{ opacity: detalles.length === 0 ? 0.5 : 1 }}>
          <ShoppingCart size={18} /> Procesar Compra
        </button>
      </form>
    </div>
  );
}

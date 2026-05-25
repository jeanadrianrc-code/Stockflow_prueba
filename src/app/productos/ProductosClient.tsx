'use client';

import { useState } from 'react';
import { deleteProducto } from '@/lib/actions';
import { Package, Trash2, X, Eye, TrendingUp, Info } from 'lucide-react';

export default function ProductosClient({ productos }: { productos: any[] }) {
  const [modalProducto, setModalProducto] = useState<any | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProducto(id);
    }
  };

  return (
    <div className="card md:col-span-2">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Inventario Actual</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th>Margen</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No hay productos registrados. Agrega uno en el formulario.
                </td>
              </tr>
            ) : (
              productos.map(p => {
                const margen = p.Costo > 0 ? ((p.Precio - p.Costo) / p.Costo) * 100 : 0;
                return (
                  <tr key={p.ID_Producto} style={{ cursor: 'pointer' }} onClick={() => setModalProducto(p)}>
                    <td>
                      <div className="flex items-center gap-3">
                        {p.Imagen ? (
                          <img src={p.Imagen} alt={p.Nombre} className="w-12 h-12 rounded object-cover hover:scale-105 transition-transform" style={{ border: '1px solid var(--border-color)' }} />
                        ) : (
                          <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                            <Package size={20} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-main)' }}>{p.Nombre}</p>
                          <p className="text-xs max-w-[150px] truncate" style={{ color: 'var(--text-muted)' }}>{p.Info || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>${(p.Costo || 0).toFixed(2)}</td>
                    <td className="font-semibold" style={{ color: 'var(--text-main)' }}>${p.Precio.toFixed(2)}</td>
                    <td className="font-bold" style={{ color: margen >= 25 ? 'var(--success)' : 'var(--warning)' }}>
                      {margen.toFixed(0)}%
                    </td>
                    <td className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>{p.Stock}</td>
                    <td>
                      <span className={`badge ${p.Estatus === 'Disponible' ? 'success' : p.Estatus === 'Agotado' ? 'danger' : 'warning'}`}>
                        {p.Estatus}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setModalProducto(p)} className="p-2 rounded-full text-blue-400 hover:bg-blue-500/10" title="Ver Detalles">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.ID_Producto)} className="p-2 rounded-full hover:bg-red-500/10" style={{ color: 'var(--danger)' }} title="Eliminar Producto">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Detalle del Producto (Vista Completa HD) */}
      {modalProducto && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '650px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Package style={{ color: 'var(--primary)' }} />
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                  Detalles del Producto
                </h3>
              </div>
              <button onClick={() => setModalProducto(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Imagen de alta calidad */}
            <div className="mb-6 rounded-lg overflow-hidden flex justify-center" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', maxHeight: '350px' }}>
              {modalProducto.Imagen ? (
                <img 
                  src={modalProducto.Imagen} 
                  alt={modalProducto.Nombre} 
                  style={{ width: '100%', maxHeight: '350px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <Package size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p className="text-sm">Sin imagen disponible</p>
                </div>
              )}
            </div>

            {/* Datos Técnicos y Financieros */}
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>{modalProducto.Nombre}</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Costo de Compra</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>${(modalProducto.Costo || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Precio de Venta</p>
                <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>${modalProducto.Precio.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Margen de Utilidad</p>
                <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                  {modalProducto.Costo > 0 ? (((modalProducto.Precio - modalProducto.Costo) / modalProducto.Costo) * 100).toFixed(0) : '0'}%
                </p>
              </div>
            </div>

            {/* Información Técnica */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Descripción / Especificaciones</h4>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {modalProducto.Info || 'Este producto no cuenta con especificaciones o descripción detallada.'}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`badge ${modalProducto.Estatus === 'Disponible' ? 'success' : modalProducto.Estatus === 'Agotado' ? 'danger' : 'warning'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                Stock: {modalProducto.Stock} ({modalProducto.Estatus})
              </span>
              <button onClick={() => setModalProducto(null)} className="btn" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

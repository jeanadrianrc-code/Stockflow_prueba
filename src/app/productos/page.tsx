export const dynamic = 'force-dynamic';

import { getProductos, createProducto, deleteProducto } from '@/lib/actions';
import { Package, Plus } from 'lucide-react';
import ProductosClient from './ProductosClient';

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <Package style={{ color: 'var(--primary)' }} />
          Gestión de Productos e Inventario
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario para agregar producto */}
        <div className="card md:col-span-1 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Añadir Nuevo</h2>
          <form action={createProducto}>
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input name="nombre" type="text" required className="form-control" placeholder="Ej. Laptop Dell" />
            </div>
            <div className="form-group">
              <label>Costo de Compra ($)</label>
              <input name="costo" type="number" step="0.01" required className="form-control" placeholder="Ej. 200.00" />
            </div>
            <div className="form-group">
              <label>Precio de Venta ($)</label>
              <input name="precio" type="number" step="0.01" required className="form-control" placeholder="Ej. 250.00" />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                💡 Tip: Para un 25% de margen, multiplica el costo por 1.25
              </p>
            </div>
            <div className="form-group">
              <label>URL de Imagen (Opcional)</label>
              <input name="imagen" type="url" className="form-control" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            <div className="form-group">
              <label>Información/Descripción</label>
              <textarea name="info" className="form-control" rows={2} placeholder="Características..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              <Plus size={18} /> Añadir Producto
            </button>
          </form>
        </div>

        {/* Lista de productos interactiva */}
        <ProductosClient productos={productos} />
      </div>
    </div>
  );
}

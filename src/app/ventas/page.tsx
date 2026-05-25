import { getVentas, getProductos, getClientes, getCompras } from '@/lib/actions';
import { Receipt, Printer } from 'lucide-react';
import FormularioVenta from './ClientVenta';
import VentasListClient from './VentasListClient';

export default async function VentasPage() {
  const ventas = await getVentas();
  const productos = await getProductos();
  const clientes = await getClientes();
  const compras = await getCompras();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <Receipt style={{ color: 'var(--primary)' }} />
          Facturación y Ventas
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <FormularioVenta productos={productos} clientes={clientes} compras={compras} />
        </div>

        <div>
          <VentasListClient ventas={ventas} />
        </div>
      </div>
    </div>
  );
}

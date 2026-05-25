import { getCompras, getProductos } from '@/lib/actions';
import { Receipt } from 'lucide-react';
import FormularioCompra from './ClientCompra';

export default async function ComprasPage() {
  const compras = await getCompras();
  const productos = await getProductos();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <Receipt style={{ color: 'var(--primary)' }} />
          Entradas y Compras
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <FormularioCompra productos={productos} />
        </div>

        <div className="card h-fit">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Historial de Lotes</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Lote</th>
                  <th>Costo</th>
                  <th>Gastos</th>
                  <th>Ingresos</th>
                  <th>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {compras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      No hay compras registradas.
                    </td>
                  </tr>
                ) : (
                  compras.map(c => (
                    <tr key={c.ID_Compra}>
                      <td style={{ color: 'var(--text-muted)' }}>{c.Fecha}</td>
                      <td className="font-semibold" style={{ color: 'var(--primary)' }}>{c.Lote}</td>
                      <td style={{ color: 'var(--text-main)' }}>${c.Total.toFixed(2)}</td>
                      <td style={{ color: 'var(--warning)' }}>${c.TotalGastos.toFixed(2)}</td>
                      <td style={{ color: 'var(--success)' }}>${c.TotalIngresos.toFixed(2)}</td>
                      <td className="font-bold" style={{ color: c.GananciaActual >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        ${c.GananciaActual.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

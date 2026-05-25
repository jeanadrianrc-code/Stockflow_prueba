export const dynamic = 'force-dynamic';

import { LayoutDashboard } from "lucide-react";
import { getResumenDashboard } from "@/lib/actions";

export default async function Home() {
  const resumen = await getResumenDashboard();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <LayoutDashboard style={{ color: 'var(--primary)' }} />
          Dashboard Principal
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Ventas del Día</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>${resumen.ventasDelDia.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Cuentas por Cobrar</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--danger)' }}>${resumen.cuentasPorCobrar.toFixed(2)}</p>
        </div>
        <div className="card" style={{ borderLeft: `4px solid ${resumen.utilidad >= 0 ? 'var(--success)' : 'var(--danger)'}` }}>
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Utilidad Neta</h3>
          <p className="text-3xl font-bold" style={{ color: resumen.utilidad >= 0 ? 'var(--success)' : 'var(--danger)' }}>${resumen.utilidad.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Total Ingresos (Abonos)</h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>${resumen.totalIngresos.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Total Compras</h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>${resumen.totalCompras.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-muted)' }} className="font-medium mb-1">Total Gastos</h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>${resumen.totalGastos.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Bienvenido a StockFlow</h2>
        <p style={{ color: 'var(--text-muted)' }} className="mb-4">
          Este panel central muestra tus indicadores financieros calculados en tiempo real.
          La <strong>Utilidad Neta</strong> se calcula como: Ingresos (Abonos recibidos) - Compras - Gastos.
        </p>
        <ul className="list-disc pl-5 space-y-2" style={{ color: 'var(--text-muted)' }}>
          <li><strong>Productos:</strong> Añade productos con imagen y precio. El stock se actualiza automáticamente.</li>
          <li><strong>Compras:</strong> Registra la mercancía entrante. Ve la ganancia por cada lote.</li>
          <li><strong>Ventas:</strong> Registra la salida de mercancía y genera PDF automáticamente.</li>
          <li><strong>Abonos:</strong> Registra pagos parciales desde Cuentas por Cobrar.</li>
          <li><strong>Gastos:</strong> Registra gastos operativos por categoría y lote.</li>
        </ul>
      </div>
    </div>
  );
}

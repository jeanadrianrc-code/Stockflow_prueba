'use client';

import { useState, useEffect } from 'react';
import { getAbonosDeVenta } from '@/lib/actions';
import { Eye, Calendar, X, FileText } from 'lucide-react';

export default function VentasListClient({ ventas }: { ventas: any[] }) {
  const [historialModalOpen, setHistorialModalOpen] = useState<string | null>(null);
  const [abonosHistorial, setAbonosHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [activeReceiptPreview, setActiveReceiptPreview] = useState<string | null>(null);

  const ventaSeleccionada = ventas.find(v => v.ID_Venta === historialModalOpen);

  useEffect(() => {
    if (historialModalOpen) {
      setCargandoHistorial(true);
      getAbonosDeVenta(historialModalOpen)
        .then(res => {
          setAbonosHistorial(res);
          setCargandoHistorial(false);
        })
        .catch(err => {
          console.error(err);
          setCargandoHistorial(false);
        });
    }
  }, [historialModalOpen]);

  return (
    <div className="card h-fit">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Últimas Facturas</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Saldo</th>
              <th>Detalle Pago</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No hay ventas registradas.
                </td>
              </tr>
            ) : (
              ventas.map(v => (
                <tr key={v.ID_Venta}>
                  <td style={{ color: 'var(--text-muted)' }}>#{v.Factura}</td>
                  <td className="font-medium" style={{ color: 'var(--text-main)' }}>{v.ClienteNombre}</td>
                  <td className="font-bold text-blue-500">${v.TotalVenta.toFixed(2)}</td>
                  <td>
                    {v.Saldo > 0 ? (
                      <span className="badge danger">Debe ${v.Saldo.toFixed(2)}</span>
                    ) : (
                      <span className="badge success">Pagado</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setHistorialModalOpen(v.ID_Venta)}
                      className="btn text-xs py-1 px-2"
                      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    >
                      <Eye size={12} /> Ver Abonos
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Historial de Abonos / Comprobantes */}
      {historialModalOpen && ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '550px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                Pagos de Factura #{ventaSeleccionada.Factura}
              </h3>
              <button onClick={() => setHistorialModalOpen(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-color)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cliente: <strong style={{ color: 'var(--text-main)' }}>{ventaSeleccionada.ClienteNombre} (C.I: {ventaSeleccionada.ClienteCedula || 'N/A'})</strong></p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total: <strong style={{ color: 'var(--primary)' }}>${ventaSeleccionada.TotalVenta.toFixed(2)}</strong></p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Abonado: <strong style={{ color: 'var(--success)' }}>${ventaSeleccionada.Abonos.toFixed(2)}</strong></p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Saldo: <strong style={{ color: 'var(--danger)' }}>${ventaSeleccionada.Saldo.toFixed(2)}</strong></p>
              </div>
            </div>

            {cargandoHistorial ? (
              <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando...</p>
            ) : abonosHistorial.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                Esta factura se registró como pagada directamente en la transacción inicial (sin abonos posteriores).
              </p>
            ) : (
              <div className="space-y-3">
                {abonosHistorial.map((abono, idx) => (
                  <div key={abono.ID_Abono} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>{abono.Fecha}</span>
                      <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>+${abono.Monto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: 'var(--text-main)' }}>
                        Ref: <strong>{abono.Referencia || 'N/A'}</strong>
                      </span>
                      {abono.Comprobante && (
                        <button
                          onClick={() => setActiveReceiptPreview(abono.Comprobante)}
                          className="btn text-xs py-0.5 px-2 flex items-center gap-1"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}
                        >
                          <Eye size={11} /> Ver Capture
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={() => setHistorialModalOpen(null)} className="btn" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de Capture Grande */}
      {activeReceiptPreview && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110
        }} onClick={() => setActiveReceiptPreview(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setActiveReceiptPreview(null)}
              style={{
                position: 'absolute', top: '-40px', right: 0, color: 'white',
                background: 'none', border: 'none', cursor: 'pointer'
              }}
            >
              <X size={28} />
            </button>
            <img src={activeReceiptPreview} alt="Comprobante Completo" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', border: '2px solid var(--border-color)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

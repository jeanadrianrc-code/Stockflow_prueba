'use client';

import { useState, useEffect } from 'react';
import { createAbono, getAbonosDeVenta } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { CreditCard, DollarSign, X, Eye, FileText, Upload, Calendar } from 'lucide-react';

export default function DeudoresClient({ deudores, totalDeuda }: { deudores: any[], totalDeuda: number }) {
  const [abonoModalOpen, setAbonoModalOpen] = useState<string | null>(null);
  const [historialModalOpen, setHistorialModalOpen] = useState<string | null>(null);
  
  // Registrar Abono form states
  const [monto, setMonto] = useState<number>(0);
  const [referencia, setReferencia] = useState('');
  const [comprobanteBase64, setComprobanteBase64] = useState<string>('');
  const [procesando, setProcesando] = useState(false);

  // Historial states
  const [abonosHistorial, setAbonosHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [activeReceiptPreview, setActiveReceiptPreview] = useState<string | null>(null);

  const router = useRouter();

  const ventaSeleccionada = deudores.find(d => d.ID_Venta === (abonoModalOpen || historialModalOpen));

  // Cargar historial de abonos
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

  // Manejar conversión de imagen a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo es demasiado grande (máximo 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprobanteBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAbonoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoModalOpen) return;
    if (monto <= 0) return alert('El monto del abono debe ser mayor a 0');
    if (ventaSeleccionada && monto > ventaSeleccionada.Saldo) {
      return alert(`El abono no puede ser mayor al saldo pendiente ($${ventaSeleccionada.Saldo.toFixed(2)})`);
    }
    
    setProcesando(true);
    await createAbono(abonoModalOpen, monto, referencia, comprobanteBase64);
    
    setAbonoModalOpen(null);
    setMonto(0);
    setReferencia('');
    setComprobanteBase64('');
    setProcesando(false);
    router.refresh();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card md:col-span-1" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 className="font-medium mb-1" style={{ color: 'var(--danger)' }}>Total Pendiente</h3>
          <p className="text-4xl font-bold" style={{ color: 'var(--text-main)' }}>${totalDeuda.toFixed(2)}</p>
        </div>
        <div className="card md:col-span-1" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 className="font-medium mb-1" style={{ color: 'var(--warning)' }}>Facturas Activas</h3>
          <p className="text-4xl font-bold" style={{ color: 'var(--text-main)' }}>{deudores.length}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Facturas con Saldo Activo</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Cliente</th>
                <th>Factura</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Abonado</th>
                <th>Saldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deudores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    ¡Excelente! No tienes clientes con deudas de pago activas.
                  </td>
                </tr>
              ) : (
                deudores.map(d => (
                  <tr key={d.ID_Venta}>
                    <td style={{ color: 'var(--text-muted)' }}>{d.ClienteCedula || 'N/A'}</td>
                    <td className="font-medium" style={{ color: 'var(--text-main)' }}>{d.ClienteNombre}</td>
                    <td style={{ color: 'var(--text-muted)' }}>#{d.Factura}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.Fecha}</td>
                    <td className="font-bold" style={{ color: 'var(--primary)' }}>${d.TotalVenta.toFixed(2)}</td>
                    <td style={{ color: 'var(--success)' }}>${d.Abonos.toFixed(2)}</td>
                    <td className="font-bold" style={{ color: 'var(--danger)' }}>${d.Saldo.toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAbonoModalOpen(d.ID_Venta); setMonto(d.Saldo); }}
                          className="btn btn-primary text-xs py-1 px-3"
                        >
                          <DollarSign size={13} /> Abonar
                        </button>
                        <button
                          onClick={() => setHistorialModalOpen(d.ID_Venta)}
                          className="btn text-xs py-1 px-3"
                          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                        >
                          <Eye size={13} /> Historial
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Abono */}
      {abonoModalOpen && ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                Registrar Abono — Factura #{ventaSeleccionada.Factura}
              </h3>
              <button onClick={() => { setAbonoModalOpen(null); setComprobanteBase64(''); }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Cliente: <strong style={{ color: 'var(--text-main)' }}>{ventaSeleccionada.ClienteNombre} (C.I: {ventaSeleccionada.ClienteCedula || 'N/A'})</strong>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Saldo Pendiente: <strong style={{ color: 'var(--danger)' }}>${ventaSeleccionada.Saldo.toFixed(2)}</strong>
              </p>
            </div>

            <form onSubmit={handleAbonoSubmit}>
              <div className="form-group">
                <label>Monto del Abono ($)</label>
                <input type="number" step="0.01" min="0.01" max={ventaSeleccionada.Saldo} value={monto} onChange={e => setMonto(Number(e.target.value))} className="form-control" required />
              </div>
              
              <div className="form-group">
                <label>Referencia de Pago (Banco, Transferencia...)</label>
                <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)} className="form-control" placeholder="Ej. Pago Móvil 87291" required />
              </div>

              <div className="form-group">
                <label>Adjuntar Capture/Comprobante (JPG/PNG)</label>
                <div style={{
                  border: '2px dashed var(--border-color)', borderRadius: 'var(--radius)',
                  padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  cursor: 'pointer', position: 'relative'
                }}>
                  <input type="file" accept="image/jpeg, image/png" onChange={handleImageChange} style={{
                    position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
                  }} />
                  {comprobanteBase64 ? (
                    <div className="text-center">
                      <img src={comprobanteBase64} alt="Capture" style={{ maxHeight: '100px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                      <p className="text-xs" style={{ color: 'var(--success)' }}>¡Capture cargado exitosamente!</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Haz clic para seleccionar o arrastra una imagen</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>Límite de archivo: 2MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setAbonoModalOpen(null); setComprobanteBase64(''); }} className="btn flex-1" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={procesando} className="btn btn-primary flex-1">
                  {procesando ? 'Procesando...' : 'Confirmar Abono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Historial de Abonos */}
      {historialModalOpen && ventaSeleccionada && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                Historial de Pagos — Factura #{ventaSeleccionada.Factura}
              </h3>
              <button onClick={() => setHistorialModalOpen(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-color)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cliente: <strong style={{ color: 'var(--text-main)' }}>{ventaSeleccionada.ClienteNombre}</strong></p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Venta: <strong style={{ color: 'var(--primary)' }}>${ventaSeleccionada.TotalVenta.toFixed(2)}</strong></p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Monto Abonado: <strong style={{ color: 'var(--success)' }}>${ventaSeleccionada.Abonos.toFixed(2)}</strong></p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Saldo Pendiente: <strong style={{ color: 'var(--danger)' }}>${ventaSeleccionada.Saldo.toFixed(2)}</strong></p>
              </div>
            </div>

            {cargandoHistorial ? (
              <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Cargando historial...</p>
            ) : abonosHistorial.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>No se han registrado abonos para esta factura.</p>
            ) : (
              <div className="space-y-3">
                {abonosHistorial.map((abono, index) => (
                  <div key={abono.ID_Abono} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Pago #{abonosHistorial.length - index}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({abono.Fecha})</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>+${abono.Monto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Ref: <strong style={{ color: 'var(--text-main)' }}>{abono.Referencia || 'Sin Referencia'}</strong>
                      </p>
                      {abono.Comprobante && (
                        <button
                          onClick={() => setActiveReceiptPreview(abono.Comprobante)}
                          className="btn text-xs py-1 px-2 flex items-center gap-1"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}
                        >
                          <Eye size={12} /> Ver Capture
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setHistorialModalOpen(null)} className="btn" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: '100px' }}>
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
    </>
  );
}

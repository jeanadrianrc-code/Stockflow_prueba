'use client';

import { useState } from 'react';
import { createGasto, createCategoria, deleteGasto } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function GastosClient({ gastos, categorias, compras }: { gastos: any[], categorias: any[], compras: any[] }) {
  const [idCategoria, setIdCategoria] = useState('');
  const [lote, setLote] = useState('');
  const [monto, setMonto] = useState<number>(0);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');
  
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const router = useRouter();

  const totalGastos = gastos.reduce((acc, g) => acc + g.Monto, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monto <= 0) return alert('El monto debe ser mayor a 0');
    
    setProcesando(true);
    let id_cat = idCategoria;

    if (modoNuevaCategoria && nuevaCategoria) {
      const res = await createCategoria(nuevaCategoria);
      id_cat = res.id;
    }

    if (!id_cat) { setProcesando(false); return alert('Seleccione o cree una categoría'); }

    await createGasto({ id_categoria: id_cat, lote, monto, fecha, notas });
    
    setIdCategoria('');
    setLote('');
    setMonto(0);
    setNotas('');
    setNuevaCategoria('');
    setModoNuevaCategoria(false);
    setProcesando(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      await deleteGasto(id);
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario */}
      <div className="card lg:col-span-1 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Registrar Gasto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="mb-0">Categoría</label>
              <button type="button" onClick={() => setModoNuevaCategoria(!modoNuevaCategoria)} className="text-xs font-bold text-blue-500">
                {modoNuevaCategoria ? 'Usar Existente' : '+ Nueva'}
              </button>
            </div>
            {modoNuevaCategoria ? (
              <input type="text" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} className="form-control" placeholder="Nombre de la categoría" />
            ) : (
              <select value={idCategoria} onChange={e => setIdCategoria(e.target.value)} className="form-control" style={{ WebkitAppearance: 'none' }}>
                <option value="">Seleccione...</option>
                {categorias.map(c => (
                  <option key={c.ID_Categoria} value={c.ID_Categoria}>{c.Nombre}</option>
                ))}
              </select>
            )}
          </div>
          <div className="form-group">
            <label>Lote Asociado (Opcional)</label>
            <select value={lote} onChange={e => setLote(e.target.value)} className="form-control" style={{ WebkitAppearance: 'none' }}>
              <option value="">Sin lote específico</option>
              {compras.map(c => (
                <option key={c.ID_Compra} value={c.Lote}>{c.Lote} ({c.Fecha})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Monto ($)</label>
            <input type="number" step="0.01" min="0.01" value={monto} onChange={e => setMonto(Number(e.target.value))} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="form-control" required />
          </div>
          <div className="form-group">
            <label>Notas (Opcional)</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)} className="form-control" placeholder="Descripción..." />
          </div>
          <button type="submit" disabled={procesando} className="btn btn-primary w-full mt-2">
            {procesando ? 'Guardando...' : <><Plus size={16} /> Registrar Gasto</>}
          </button>
        </form>
      </div>

      {/* Historial de gastos */}
      <div className="lg:col-span-2">
        <div className="card mb-4" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 className="font-medium mb-1" style={{ color: 'var(--warning)' }}>Total Gastos Registrados</h3>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>${totalGastos.toFixed(2)}</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Historial de Gastos</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Lote</th>
                  <th>Monto</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gastos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      No hay gastos registrados.
                    </td>
                  </tr>
                ) : (
                  gastos.map(g => (
                    <tr key={g.ID_Gasto}>
                      <td style={{ color: 'var(--text-muted)' }}>{g.Fecha}</td>
                      <td>
                        <span className="badge warning">{g.CategoriaNombre}</span>
                      </td>
                      <td style={{ color: 'var(--primary)' }}>{g.Lote || '—'}</td>
                      <td className="font-bold" style={{ color: 'var(--danger)' }}>${g.Monto.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{g.Notas || '—'}</td>
                      <td>
                        <button onClick={() => handleDelete(g.ID_Gasto)} className="p-1 rounded-full" style={{ color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
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

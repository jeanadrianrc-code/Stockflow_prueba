import { getClientes, createCliente, deleteCliente } from '@/lib/actions';
import { Users, Plus, Trash2 } from 'lucide-react';

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <Users style={{ color: 'var(--primary)' }} />
          Directorio de Clientes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="card md:col-span-1 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Añadir Cliente</h2>
          <form action={async (formData: FormData) => {
            "use server"
            const nombre = formData.get('nombre')?.toString() || '';
            const telefono = formData.get('telefono')?.toString() || '';
            const cedula = formData.get('cedula')?.toString() || '';
            await createCliente(nombre, telefono, cedula);
          }}>
            <div className="form-group">
              <label>Cédula de Identidad</label>
              <input name="cedula" type="text" className="form-control" placeholder="V-12345678" />
            </div>
            <div className="form-group">
              <label>Nombre del Cliente</label>
              <input name="nombre" type="text" required className="form-control" placeholder="Ej. Juan Pérez" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input name="telefono" type="text" className="form-control" placeholder="0414-000-0000" />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              <Plus size={18} /> Añadir Cliente
            </button>
          </form>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Nota: También puedes crear clientes directamente desde el formulario de Nueva Venta.
          </p>
        </div>

        {/* Lista */}
        <div className="card md:col-span-2">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Clientes Registrados ({clientes.length})</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      No hay clientes registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  clientes.map(c => (
                    <tr key={c.ID_Cliente}>
                      <td style={{ color: 'var(--text-muted)' }}>{c.Cedula || 'N/A'}</td>
                      <td className="font-medium" style={{ color: 'var(--text-main)' }}>{c.Nombre}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.Telefono || 'N/A'}</td>
                      <td className="text-right">
                        <form action={async () => {
                          "use server"
                          await deleteCliente(c.ID_Cliente);
                        }}>
                          <button type="submit" className="p-2 rounded-full" style={{ color: 'var(--danger)' }} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </form>
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

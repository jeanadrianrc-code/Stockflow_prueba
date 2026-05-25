import { getGastos, getCategorias, getCompras } from '@/lib/actions';
import { DollarSign } from 'lucide-react';
import GastosClient from './GastosClient';

export default async function GastosPage() {
  const gastos = await getGastos();
  const categorias = await getCategorias();
  const compras = await getCompras();

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <DollarSign style={{ color: 'var(--primary)' }} />
          Control de Gastos Operativos
        </h1>
      </div>

      <GastosClient gastos={gastos} categorias={categorias} compras={compras} />
    </div>
  );
}

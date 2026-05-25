import { getVentas } from '@/lib/actions';
import { CreditCard } from 'lucide-react';
import DeudoresClient from './DeudoresClient';

export default async function DeudoresPage() {
  const ventas = await getVentas();
  const deudores = ventas.filter(v => v.Saldo > 0);
  const totalDeuda = deudores.reduce((acc, curr) => acc + curr.Saldo, 0);

  return (
    <div className="page-container">
      <div className="header mb-6 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="flex items-center gap-2">
          <CreditCard style={{ color: 'var(--primary)' }} />
          Cuentas por Cobrar
        </h1>
      </div>

      <DeudoresClient deudores={deudores} totalDeuda={totalDeuda} />
    </div>
  );
}

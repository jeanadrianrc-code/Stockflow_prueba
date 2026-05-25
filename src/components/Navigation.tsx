'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, DollarSign, Receipt, Menu, X, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, isMain: true },
    { name: 'Ventas', href: '/ventas', icon: ShoppingCart, isMain: true },
    { name: 'Compras', href: '/compras', icon: Receipt, isMain: true },
    { name: 'Cuentas x Cobrar', href: '/deudores', icon: CreditCard, isMain: true },
    { name: 'Productos', href: '/productos', icon: Package, isMain: false },
    { name: 'Clientes', href: '/clientes', icon: Users, isMain: false },
    { name: 'Gastos', href: '/gastos', icon: DollarSign, isMain: false },
  ];

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>StockFlow</span>
            {/* Botón X solo visible en móvil */}
            <button className="mobile-only-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={22} />
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay para cerrar menú en móvil */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Top Header — solo visible en móvil */}
      <div className="mobile-header">
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>StockFlow</span>
        <button onClick={() => setIsMobileMenuOpen(true)} style={{ color: 'var(--text-main)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={24} />
        </button>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {navItems.filter(item => item.isMain).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

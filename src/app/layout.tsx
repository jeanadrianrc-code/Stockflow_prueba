import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "App de Compras y Ventas",
  description: "Sistema local de facturación e inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            <div className="pt-16 md:pt-0 pb-20 md:pb-0">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Layout principal para las páginas del sitio público (no de administración).
 * Este componente envuelve las páginas del sitio, proporcionando una estructura
 * común con un encabezado (Header) y un pie de página (Footer).
 * 
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que se renderizarán dentro de este layout (las páginas).
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Componente del encabezado de la página */}
      <Header />
      {/* El contenido principal de la página se renderiza aquí. */}
      <main className="flex-1">{children}</main>
      {/* Componente del pie de página */}
      <Footer />
    </div>
  );
}

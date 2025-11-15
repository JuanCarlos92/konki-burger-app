import type {Metadata} from 'next';
import './globals.css';
import { AppProvider } from '@/lib/contexts/AppContext';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { DataSeeder } from '@/components/DataSeeder';

/**
 * Metadatos de la aplicación.
 * Se usan para el SEO y para el título y descripción en la pestaña del navegador.
 */
export const metadata: Metadata = {
  title: 'Konki Burger',
  description: '¡Las mejores hamburguesas!',
};

/**
 * Layout raíz de la aplicación.
 * Este componente envuelve toda la aplicación y es el punto de entrada principal.
 * Configura los proveedores de contexto globales que deben estar disponibles en todas las páginas.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - El contenido de la aplicación (las páginas).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Se añade `suppressHydrationWarning={true}` al <html> para evitar avisos
    // relacionados con el uso de temas (dark/light) y extensiones de navegador que pueden
    // modificar el HTML antes de que React lo hidrate.
    <html lang="es" className="dark" suppressHydrationWarning={true}>
      <head>
        {/* Precarga de las fuentes de Google Fonts para mejorar el rendimiento de la carga. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Proveedor para inicializar y dar acceso a los servicios de Firebase en el lado del cliente. */}
        <FirebaseClientProvider>
          {/* Proveedor del contexto global de la aplicación (gestiona carrito, autenticación, productos, etc.). */}
          <AppProvider>
            {/* Componente para sembrar la base de datos con datos iniciales si está vacía. */}
            <DataSeeder />
            {/* El contenido principal de la aplicación (las páginas) se renderiza aquí. */}
            {children}
            {/* Componente para mostrar notificaciones (toasts) en toda la aplicación. */}
            <Toaster />
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

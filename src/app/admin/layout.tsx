"use client";

import { AdminSidebar } from "./components/AdminSidebar";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader, Menu } from "lucide-react";
import { useAppContext } from "@/lib/contexts/AppContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Componente de encabezado que solo se muestra en dispositivos móviles.
 * Contiene el botón para abrir el menú lateral (sidebar).
 */
const AdminContentHeader = () => {
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            {/* El SidebarTrigger es el botón "hamburguesa" que abre el menú en móviles. */}
            <SidebarTrigger size="icon" variant="outline">
                <Menu className="h-5 w-5" />
            </SidebarTrigger>
             <Link href="/" className="flex items-center gap-2">
              <Menu className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg font-headline">Konki Burger</span>
            </Link>
        </header>
    );
};


/**
 * Layout principal para el panel de administración.
 * Este componente actúa como un "guardián de ruta", protegiendo todas las rutas bajo `/admin`.
 * Verifica si el usuario está autenticado y si tiene permisos de administrador antes de renderizar el contenido.
 * 
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - El contenido de la página de administración a renderizar.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hooks para obtener el estado de autenticación y el router.
  const { user, isUserLoading } = useUser(); // Hook de Firebase para el usuario autenticado.
  const { isAdmin, isUserLoading: isAppLoading } = useAppContext(); // Hook del contexto para saber si es admin.
  const router = useRouter();
  
  // Combina todos los estados de carga en uno solo para simplificar la lógica de renderizado.
  const isLoading = isUserLoading || isAppLoading;

  useEffect(() => {
    // Si aún está cargando la información del usuario, no hacer nada para evitar redirecciones prematuras.
    if (isLoading) {
      return;
    }
    // Si la carga ha terminado y no hay un usuario autenticado, redirigir a la página de inicio.
    if (!user) {
      router.replace('/');
    }
    // Si el usuario está autenticado pero no es admin, la lógica de renderizado más abajo
    // se encargará de mostrar el mensaje de "Acceso Denegado".
  }, [user, isLoading, router]);


  // 1. Mostrar un estado de carga mientras se verifica la autenticación y los permisos.
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold font-headline">Verificando Acceso...</h1>
            <p className="text-muted-foreground">Por favor, espera mientras comprobamos tus credenciales.</p>
        </div>
    )
  }

  // 2. Si la carga ha finalizado y el usuario es un administrador, renderizar el layout y el contenido.
    if (user && isAdmin) {
        return (
            <AdminSidebar>
                <div className="flex flex-col">
                    <AdminContentHeader />
                    <main className="flex-1">{children}</main>
                </div>
            </AdminSidebar>
        );
    }

  // 3. Si la carga ha finalizado pero el usuario no es admin (o no está logueado), mostrar "Acceso Denegado".
  return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-3xl font-bold font-headline mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-6">No tienes permiso para ver esta página. Por favor, inicia sesión con una cuenta de administrador.</p>
          <Button asChild>
              <Link href="/">Volver a Inicio</Link>
          </Button>
      </div>
  );
}
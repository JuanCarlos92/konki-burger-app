"use client";

import { AdminSidebar } from "./components/AdminSidebar";
import { useUser } from "@/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useAppContext } from "@/lib/contexts/AppContext";

/**
 * Layout principal para el panel de administración.
 * Este componente es un "guardia de ruta" que protege todas las rutas bajo `/admin`.
 * Verifica si el usuario está autenticado y si tiene permisos de administrador.
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
  
  // Combina todos los estados de carga en uno solo para simplificar la lógica.
  const isLoading = isUserLoading || isAppLoading;

  useEffect(() => {
    // Si aún está cargando, no hacer nada para permitir que se muestre la UI de carga.
    if (isLoading) {
      return;
    }
    // Si la carga ha terminado y no hay un usuario autenticado, redirigir a la página de login.
    if (!user) {
      router.replace('/login');
    }
    // No se necesita otra condición. La lógica de renderizado más abajo se encarga del caso de acceso denegado.
  }, [user, isLoading, router]);


  // 1. Mostrar un estado de carga mientras se verifica la autenticación y autorización.
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
          {children}
        </AdminSidebar>
    );
  }

  // 3. Si la carga ha finalizado pero el usuario no es admin o no está logueado, mostrar "Acceso Denegado".
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

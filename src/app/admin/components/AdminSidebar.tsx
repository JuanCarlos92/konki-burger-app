"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, ShoppingBasket, Users, Home, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppContext } from "@/lib/contexts/AppContext";
import { ClientTooltipProvider } from "@/components/ui/client-tooltip-provider";

// Define los elementos de navegación para la barra lateral del administrador.
const navItems = [
  { href: "/admin/orders", icon: ShoppingBasket, label: "Pedidos" },
  { href: "/admin/products", icon: Package, label: "Productos" },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
];

/**
 * Componente de la barra lateral para el panel de administración.
 * Proporciona la navegación principal dentro del área de administración.
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - El contenido principal de la página que se renderizará a la derecha de la barra.
 */
export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAppContext();

  return (
    // Proveedor para los tooltips flotantes que aparecen al colapsar la barra.
    <ClientTooltipProvider>
      {/* Proveedor de estado para la barra lateral (expandida/colapsada). */}
      <SidebarProvider>
        <Sidebar>
          {/* Cabecera de la barra lateral con el logo y el nombre de la aplicación. */}
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <Menu className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg font-headline">Konki Burger</span>
            </Link>
          </SidebarHeader>

          {/* Contenido principal de la barra lateral con el menú de navegación. */}
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* Pie de la barra lateral con información del usuario y enlaces de acción. */}
          <SidebarFooter>
            <SidebarMenu>
                {/* Enlace para volver al sitio público */}
                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton>
                      <Home />
                      Volver al Sitio
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                {/* Muestra la información del usuario si está logueado. */}
                {currentUser && (
                    <SidebarMenuItem>
                      <div className="flex items-center gap-2 p-2">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} />
                              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold">{currentUser.name}</span>
                              <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                          </div>
                      </div>
                    </SidebarMenuItem>
                )}

                {/* Botón para cerrar sesión. */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout}>
                    <LogOut />
                    Cerrar Sesión
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* El contenido de la página se renderiza aquí, dentro de un contenedor que se ajusta a la barra lateral. */}
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ClientTooltipProvider>
  );
}

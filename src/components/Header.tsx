"use client";

import Link from "next/link";
import { ShoppingCart, LogIn, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/contexts/AppContext";
import { CartSheet } from "./CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

/**
 * Componente del encabezado principal de la aplicación.
 * Muestra el logo, la navegación, el icono del carrito de compras y las opciones de usuario
 * (como iniciar sesión, registrarse, ver el perfil o cerrar sesión).
 */
export function Header() {
  const { cartCount, isAuthenticated, logout, currentUser, isAdmin } = useAppContext();
  // Estado para asegurar que el renderizado que depende del cliente (como el estado de autenticación)
  // solo ocurra después de la hidratación en el navegador. Esto previene errores de "hydration mismatch".
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Al montar el componente en el cliente, se establece isClient a true.
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo y nombre de la aplicación, enlazados a la página de inicio. */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Menu className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg sm:inline-block">
            Konki Burger
          </span>
        </Link>
        {/* Navegación principal */}
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Carrito de compras, que abre un panel lateral (`CartSheet`). */}
          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {/* El contador del carrito solo se muestra en el cliente y si hay artículos. */}
              {isClient && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {cartCount}
                </span>
              )}
            </Button>
          </CartSheet>

          {/* Lógica condicional para mostrar el menú de usuario o los botones de login/registro. */}
          {isClient && isAuthenticated && currentUser ? (
            // Si el usuario está autenticado, muestra un menú desplegable con su avatar.
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {/* Si el usuario es administrador, muestra un enlace al panel de administración. */}
                 {isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Panel de Admin
                    </DropdownMenuItem>
                  </Link>
                 )}
                <DropdownMenuItem onClick={logout}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Si el usuario no está autenticado, muestra los botones de "Iniciar Sesión" y "Registrarse".
            // Se comprueba `isClient` para evitar el "hydration mismatch".
            isClient && (
                <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost">
                        <Link href="/login">
                            <span className="flex items-center">
                                <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                            </span>
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">
                            Registrarse
                        </Link>
                    </Button>
                </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}

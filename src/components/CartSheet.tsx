"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/lib/contexts/AppContext";
import { CartItem } from "./CartItem";

/**
 * Componente que muestra el carrito de compras en un panel lateral deslizable (Sheet).
 * El panel se activa mediante un elemento "disparador" que se pasa como hijo.
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - El elemento que actuará como disparador para abrir el panel (ej. un botón de carrito).
 */
export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, cartTotal, cartCount } = useAppContext();

  return (
    <Sheet>
      {/* El disparador (`SheetTrigger`) es el elemento hijo que se pasa al componente. */}
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Tu Carrito ({cartCount})</SheetTitle>
        </SheetHeader>
        {cart.length > 0 ? (
          // Si el carrito tiene artículos, muestra la lista, el total y el botón de checkout.
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="flex flex-col divide-y">
                {/* Mapea y renderiza cada artículo del carrito. */}
                {cart.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-4">
              <div className="w-full space-y-4">
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {/* El botón para proceder al checkout también cierra el panel lateral. */}
                <SheetClose asChild>
                  <Button asChild className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          // Si el carrito está vacío, muestra un mensaje informativo y un botón para seguir comprando.
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="font-headline text-2xl mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-4">¡Añade algunas deliciosas hamburguesas para empezar!</p>
            <SheetClose asChild>
                <Button variant="outline">Seguir Comprando</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

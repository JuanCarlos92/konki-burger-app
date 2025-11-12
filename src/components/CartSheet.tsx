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
 * Componente que muestra el carrito de compras en un panel lateral (Sheet).
 * @param {object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - El elemento que actuará como disparador para abrir el panel.
 */
export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cart, cartTotal, cartCount } = useAppContext();

  return (
    <Sheet>
      {/* El disparador es el elemento hijo que se pasa al componente (ej. un botón de carrito). */}
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Tu Carrito ({cartCount})</SheetTitle>
        </SheetHeader>
        {cart.length > 0 ? (
          // Si el carrito tiene artículos, muestra la lista y el total.
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="flex flex-col divide-y">
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
                {/* Botón para proceder al checkout, que también cierra el panel. */}
                <SheetClose asChild>
                  <Button asChild className="w-full" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          // Si el carrito está vacío, muestra un mensaje.
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

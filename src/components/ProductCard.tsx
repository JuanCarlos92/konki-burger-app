"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/lib/contexts/AppContext";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

/**
 * Propiedades para el componente ProductCard.
 */
interface ProductCardProps {
  product: Product;
}

/**
 * Componente que muestra la información de un único producto en una tarjeta.
 * Incluye imagen, nombre, descripción, precio y un botón para añadirlo al carrito.
 * @param {ProductCardProps} props - Las propiedades del componente.
 */
export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();
  const { toast } = useToast();

  /**
   * Maneja el evento de clic en el botón "Añadir al Carrito".
   * Llama a la función `addToCart` del contexto y muestra una notificación de éxito.
   */
  const handleAddToCart = () => {
    addToCart(product);
    toast({
        title: "¡Añadido al Carrito!",
        description: `${product.name} te está esperando.`,
    })
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-primary/20 hover:shadow-2xl">
      <CardHeader className="p-0">
        {/* Contenedor de la imagen del producto */}
        <div className="relative aspect-video">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            data-ai-hint={product.image.aiHint}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        {/* Contenedor del título y la descripción */}
        <div className="p-6">
            <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
            <CardDescription className="mt-2 text-base">{product.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      {/* Pie de la tarjeta con el precio y el botón de acción */}
      <CardFooter className="flex justify-between items-center p-6 pt-0">
        <p className="text-2xl font-bold font-headline text-primary">${product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir al Carrito
        </Button>
      </CardFooter>
    </Card>
  );
}

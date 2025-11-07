"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/lib/contexts/AppContext";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
        title: "Added to Cart!",
        description: `${product.name} is waiting for you.`,
    })
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-primary/20 hover:shadow-2xl">
      <CardHeader className="p-0">
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
        <div className="p-6">
            <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
            <CardDescription className="mt-2 text-base">{product.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex justify-between items-center p-6 pt-0">
        <p className="text-2xl font-bold font-headline text-primary">${product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

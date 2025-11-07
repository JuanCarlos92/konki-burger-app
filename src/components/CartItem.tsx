"use client";

import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/contexts/AppContext";
import type { CartItem as CartItemType } from "@/lib/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartQuantity, removeFromCart } = useAppContext();

  const handleQuantityChange = (newQuantity: number) => {
    updateCartQuantity(item.product.id, newQuantity);
  };

  return (
    <div className="flex items-center space-x-4 py-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.product.image.src}
          alt={item.product.image.alt}
          data-ai-hint={item.product.image.aiHint}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">
          ${item.product.price.toFixed(2)}
        </p>
        <div className="mt-2 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            className="h-8 w-12 text-center mx-2"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFromCart(item.product.id)}
      >
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
    </div>
  );
}

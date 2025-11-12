"use client";

import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/contexts/AppContext";

/**
 * Propiedades para el componente ProductActions.
 */
interface ProductActionsProps {
  product: Product; // El objeto del producto.
  onEdit: () => void; // Función a llamar cuando se hace clic en "Editar".
}

/**
 * Componente que muestra los botones de acción para un producto (Editar, Eliminar).
 * @param {ProductActionsProps} props - Las propiedades del componente.
 */
export function ProductActions({ product, onEdit }: ProductActionsProps) {
  const { toast } = useToast();
  const { deleteProduct } = useAppContext();

  /**
   * Maneja la acción de eliminar un producto.
   * Llama a la función `deleteProduct` del contexto y muestra una notificación.
   */
  const handleDelete = () => {
    deleteProduct(product.id);
    toast({ variant: "destructive", title: "Producto Eliminado", description: `"${product.name}" ha sido eliminado.` });
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        {/* Botón para editar el producto, llama a la función `onEdit` pasada por props. */}
        <Button size="sm" variant="outline" onClick={onEdit}>
          Editar
        </Button>
        
        {/* Diálogo de confirmación para eliminar el producto. */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "{product.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

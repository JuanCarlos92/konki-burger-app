
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAppContext } from "@/lib/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@/lib/types";

/**
 * Esquema de validación para el formulario de producto utilizando Zod.
 * Define las reglas para cada campo del formulario.
 */
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  category: z.string({ required_error: "Por favor, selecciona una categoría." }),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).min(1, { message: "La URL de la imagen es obligatoria." }),
});

/**
 * Propiedades para el componente ProductForm.
 */
interface ProductFormProps {
  product?: Product; // El producto a editar (opcional). Si no se proporciona, es un formulario de creación.
  open: boolean; // Controla si el diálogo está abierto.
  onOpenChange: (open: boolean) => void; // Función para cambiar el estado de apertura del diálogo.
  categories: Category[]; // Lista de categorías disponibles para el selector.
}

/**
 * Un formulario renderizado dentro de un diálogo modal para crear o editar un producto.
 * @param {ProductFormProps} props - Las propiedades del componente.
 */
export function ProductForm({ product, open, onOpenChange, categories }: ProductFormProps) {
  const { addProduct, updateProduct } = useAppContext();
  const { toast } = useToast();

  // Configuración del formulario con `react-hook-form` y el resolver de Zod.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Los valores por defecto se basan en el producto proporcionado (para edición) o son vacíos (para creación).
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: product?.category || "",
      imageUrl: product?.imageUrl || "",
    },
  });

  /**
   * Efecto que resetea el formulario cuando el producto a editar cambia o cuando se abre para crear uno nuevo.
   * Esto asegura que si el usuario cierra el diálogo de edición de un producto y
   * abre el de otro (o el de creación), el formulario muestre los datos correctos y no los anteriores.
   */
  React.useEffect(() => {
    form.reset({
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: product?.category || "",
      imageUrl: product?.imageUrl || "",
    });
  }, [product, form, open]);

  /**
   * Función que se ejecuta al enviar el formulario.
   * Distingue entre la lógica de crear y la de actualizar un producto.
   * @param {object} values - Los valores validados del formulario.
   */
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (product) {
      // Si se proporcionó un `product`, se actualiza el existente.
      updateProduct(product.id, values);
      toast({ title: "¡Producto Actualizado!" });
    } else {
      // Si no hay `product`, se crea uno nuevo.
      addProduct(values);
      toast({ title: "¡Producto Añadido!" });
    }
    // Cierra el diálogo después de la operación.
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Añadir Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Konki Clásica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Una jugosa hamburguesa de ternera..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="9.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(categories || []).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

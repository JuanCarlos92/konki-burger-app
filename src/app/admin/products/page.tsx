
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductForm } from "../components/ProductForm";
import { ProductActions } from "../components/ProductActions";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Product, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Página de administración para gestionar los productos del menú.
 * Permite ver una lista de todos los productos y realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).
 */
export default function AdminProductsPage() {
  const firestore = useFirestore();
  // Estado para controlar la visibilidad del formulario de producto (que se muestra en un diálogo modal).
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Estado para almacenar el producto que se está editando. Si es `undefined`, el formulario es para crear un nuevo producto.
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Obtiene la colección de productos de Firestore en tiempo real.
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

  // Obtiene la colección de categorías de Firestore para poder mostrar el nombre de la categoría.
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  /**
   * Abre el formulario en modo de edición, pasando los datos del producto seleccionado.
   * @param {Product} product - El producto que se va a editar.
   */
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  /**
   * Abre el formulario en modo de creación (reseteando cualquier producto en edición).
   */
  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  /**
   * Obtiene el nombre de una categoría a partir de su ID.
   * Busca en la lista de categorías cargada.
   * @param {string} categoryId - El ID de la categoría a buscar.
   * @returns {string} El nombre de la categoría o 'N/A' si no se encuentra.
   */
  const getCategoryName = (categoryId: string) => {
    return (categories || []).find(c => c.id === categoryId)?.name || 'N/A';
  }

  // Estado de carga combinado: la interfaz muestra un esqueleto de carga si los productos o las categorías están cargando.
  const isLoading = isLoadingProducts || isLoadingCategories;

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl">Gestión de Productos</CardTitle>
                <CardDescription>
                    Añade, edita o elimina productos del menú.
                </CardDescription>
            </div>
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Muestra esqueletos de carga mientras los datos se están obteniendo. */}
              {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                 ))
              // Muestra un mensaje si no hay productos.
              ) : !products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No se encontraron productos. ¡Añade uno para empezar!
                  </TableCell>
                </TableRow>
              // Renderiza la tabla con la lista de productos.
              ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        {product.imageUrl && (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{product.description}</div>
                  </TableCell>
                  <TableCell>{getCategoryName(product.category)}</TableCell>
                  <TableCell className="text-right font-mono">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <ProductActions product={product} onEdit={() => handleEdit(product)} />
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Componente del formulario, que se muestra en un diálogo. Se pasa el producto a editar
          y los estados para controlar su visibilidad. */}
      <ProductForm 
        product={editingProduct} 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        categories={categories || []} 
      />
    </div>
  );
}

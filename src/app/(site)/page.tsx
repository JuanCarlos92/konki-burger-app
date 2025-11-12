"use client";

import { useState, useMemo } from 'react';
import { CategoryFilters } from "@/components/CategoryFilters";
import { ProductCard } from "@/components/ProductCard";
import { useAppContext } from "@/lib/contexts/AppContext";
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, Category } from '@/lib/types';

/**
 * Página de inicio de la aplicación.
 * Muestra el catálogo de productos y permite filtrarlos por categoría.
 */
export default function HomePage() {
  // Hooks para obtener datos y estado de la aplicación.
  const { isUserLoading } = useAppContext(); // Estado de carga del usuario desde el contexto.
  const firestore = useFirestore(); // Instancia de Firestore.

  // Consulta para obtener la colección de productos de Firestore.
  // useMemoFirebase asegura que la consulta no se recree en cada render.
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  // Consulta para obtener la colección de categorías de Firestore.
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading: isCategoriesLoading } = useCollection<Category>(categoriesQuery);

  // Estado para almacenar la categoría seleccionada por el usuario.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /**
   * Memoiza los productos filtrados.
   * Se recalcula solo si la lista de productos o la categoría seleccionada cambian.
   */
  const filteredProducts = useMemo(() => {
    const productList = products || [];
    if (!selectedCategory) {
      // Si no hay categoría seleccionada, devuelve todos los productos.
      return productList;
    }
    // Filtra los productos por el ID de la categoría seleccionada.
    return productList.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Estado de carga general: la página está cargando si cualquiera de las consultas está en progreso.
  const isLoading = isUserLoading || isProductsLoading || isCategoriesLoading;

  return (
    <div className="container py-8">
      {/* Sección de bienvenida */}
      <section className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-red-400 to-accent">
          Welcome to Konki Burger
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
          Experience the most delicious, out-of-this-world burgers, crafted with the freshest ingredients and a touch of cosmic magic.
        </p>
      </section>

      {/* Sección de filtros por categoría */}
      <section className="mb-12">
        <CategoryFilters 
          categories={categories || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* Sección de la parrilla de productos */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Muestra esqueletos de carga mientras los datos se están obteniendo. */}
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
          {/* Muestra las tarjetas de producto una vez que los datos han cargado. */}
          {!isLoading && filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Muestra un mensaje si no se encuentran productos para la categoría seleccionada. */}
        {!isLoading && filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground col-span-full py-12">No se encontraron hamburguesas para esta categoría. ¡Prueba con otra!</p>
        )}
      </section>
    </div>
  );
}

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
 * Muestra un banner de bienvenida, filtros de categorías y el catálogo de productos.
 */
export default function HomePage() {
  // Hooks para obtener datos y estado del contexto y de Firebase.
  const { isUserLoading } = useAppContext(); // Obtiene el estado de carga del usuario desde el contexto.
  const firestore = useFirestore(); // Obtiene la instancia de Firestore.

  // Consulta para obtener la colección de productos de Firestore.
  // `useMemoFirebase` es crucial para evitar que la consulta se recree en cada render,
  // lo que causaría re-suscripciones infinitas en `useCollection`.
  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  // Consulta para obtener la colección de categorías de Firestore.
  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading: isCategoriesLoading } = useCollection<Category>(categoriesQuery);

  // Estado local para almacenar el ID de la categoría seleccionada por el usuario.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /**
   * Memoiza la lista de productos filtrados.
   * `useMemo` asegura que esta lógica de filtrado solo se ejecute si la lista de productos
   * o la categoría seleccionada cambian, optimizando el rendimiento.
   */
  const filteredProducts = useMemo(() => {
    const productList = products || [];
    // Si no hay ninguna categoría seleccionada (null), devuelve todos los productos.
    if (!selectedCategory) {
      return productList;
    }
    // Filtra los productos cuyo `categoryId` coincide con el seleccionado.
    return productList.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Estado de carga general: la página se considera "cargando" si cualquiera de las
  // consultas (usuario, productos, categorías) está en progreso.
  const isLoading = isUserLoading || isProductsLoading || isCategoriesLoading;

  return (
    <div className="container mx-auto max-w-screen-xl py-8">
      {/* Sección de bienvenida */}
      <section className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-red-400 to-accent">
          Konki Burger
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
          Konki Burguer te ofrece hamburguesas artesanales, con ingredientes frescos y de calidad, en el corazón de La Laguna. Tradición local, sabor auténtico. ¡Ven y disfruta!
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
          {/* Muestra esqueletos de carga (placeholders) mientras los datos se están obteniendo. */}
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
          {/* Cuando la carga ha finalizado, muestra las tarjetas de producto filtradas. */}
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

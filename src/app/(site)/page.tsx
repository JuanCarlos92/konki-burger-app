"use client";

import { useState, useMemo } from 'react';
import { CategoryFilters } from "@/components/CategoryFilters";
import { ProductCard } from "@/components/ProductCard";
import { useAppContext } from "@/lib/contexts/AppContext";
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, Category } from '@/lib/types';

export default function HomePage() {
  const { isUserLoading } = useAppContext();
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading: isCategoriesLoading } = useCollection<Category>(categoriesQuery);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const productList = products || [];
    if (!selectedCategory) {
      return productList;
    }
    return productList.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const isLoading = isUserLoading || isProductsLoading || isCategoriesLoading;

  return (
    <div className="container py-8">
      <section className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-red-400 to-accent">
          Welcome to Konki Burger
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
          Experience the most delicious, out-of-this-world burgers, crafted with the freshest ingredients and a touch of cosmic magic.
        </p>
      </section>

      <section className="mb-12">
        <CategoryFilters 
          categories={categories || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
          {!isLoading && filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!isLoading && filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground col-span-full py-12">No burgers found for this category. Try another one!</p>
        )}
      </section>
    </div>
  );
}

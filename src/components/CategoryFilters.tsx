"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

/**
 * Propiedades para el componente CategoryFilters.
 */
interface CategoryFiltersProps {
  categories: Category[]; // Lista de todas las categorías disponibles.
  selectedCategory: string | null; // ID de la categoría actualmente seleccionada, o null si es "Todas".
  onSelectCategory: (categoryId: string | null) => void; // Función a llamar cuando se selecciona una categoría.
}

/**
 * Componente que renderiza una lista de botones para filtrar productos por categoría.
 * @param {CategoryFiltersProps} props - Las propiedades del componente.
 */
export function CategoryFilters({ categories, selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Botón para mostrar "Todas" las categorías. */}
      <Button
        // El estilo del botón cambia si es el actualmente seleccionado.
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null)}
      >
        Todas
      </Button>
      {/* Mapea y renderiza un botón por cada categoría. */}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}

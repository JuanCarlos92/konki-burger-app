"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";

/**
 * Propiedades para el componente CategoryFilters.
 */
interface CategoryFiltersProps {
  categories: Category[]; // Lista de todas las categorías disponibles.
  selectedCategory: string | null; // ID de la categoría actualmente seleccionada, o `null` si se ha seleccionado "Todas".
  onSelectCategory: (categoryId: string | null) => void; // Función callback a llamar cuando se selecciona una categoría.
}

/**
 * Componente que renderiza una lista de botones para filtrar productos por categoría.
 * Incluye un botón "Todas" para eliminar el filtro.
 * @param {CategoryFiltersProps} props - Las propiedades del componente.
 */
export function CategoryFilters({ categories, selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Botón para mostrar "Todas" las categorías. No tiene un ID de categoría (usa `null`). */}
      <Button
        // El estilo del botón (`variant`) cambia si es el actualmente seleccionado,
        // proporcionando feedback visual al usuario.
        variant={selectedCategory === null ? 'default' : 'outline'}
        onClick={() => onSelectCategory(null)}
      >
        Todas
      </Button>
      {/* Mapea y renderiza un botón por cada categoría recibida en las props. */}
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

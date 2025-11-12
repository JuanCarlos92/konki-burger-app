import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Función de utilidad para fusionar clases de Tailwind CSS de forma segura.
 * Combina `clsx` (para clases condicionales) y `tw-merge` (para resolver conflictos de clases de Tailwind).
 * 
 * Ejemplo de uso:
 * cn("p-4", "bg-red-500", true && "text-white") // => "p-4 bg-red-500 text-white"
 * cn("p-4", "p-2") // => "p-2" (tw-merge resuelve el conflicto y mantiene la última)
 * 
 * @param {...ClassValue[]} inputs - Una lista de clases, strings, objetos o arrays a combinar.
 * @returns {string} Una cadena de clases CSS optimizada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

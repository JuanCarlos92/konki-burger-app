import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Función de utilidad para fusionar clases de Tailwind CSS de forma segura e inteligente.
 * Combina `clsx` (para manejar clases condicionales de forma elegante) y `tw-merge` (para resolver
 * conflictos de clases de Tailwind, asegurando que la última clase de una misma propiedad prevalezca).
 * 
 * Ejemplo de uso con `clsx`:
 * cn("p-4", "bg-red-500", true && "text-white", false && "font-bold") 
 * // => "p-4 bg-red-500 text-white"
 * 
 * Ejemplo de uso con `twMerge`:
 * cn("p-4 bg-blue-500", "p-2") 
 * // => "bg-blue-500 p-2" (tw-merge resuelve el conflicto y mantiene la última clase de padding)
 * 
 * @param {...ClassValue[]} inputs - Una lista de valores de clase. Pueden ser strings, arrays, u objetos.
 * @returns {string} Una cadena de clases CSS optimizada y sin conflictos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import * as React from "react"

// Define el punto de corte en píxeles para considerar un dispositivo como "móvil".
const MOBILE_BREAKPOINT = 768

/**
 * Hook personalizado para detectar si el dispositivo actual es móvil basándose en el ancho de la ventana del navegador.
 * Devuelve `true` si el ancho es menor que el punto de corte definido (`MOBILE_BREAKPOINT`).
 * @returns {boolean} `true` si el dispositivo es considerado móvil, de lo contrario `false`.
 */
export function useIsMobile() {
  // El estado `isMobile` se inicializa como `undefined` para manejar correctamente el renderizado del lado del servidor (SSR),
  // donde el objeto `window` no está disponible y no se puede determinar el tamaño de la pantalla.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Esta lógica solo se ejecuta en el cliente, donde `window` está disponible.
    
    // `window.matchMedia` es una API del navegador para comprobar si un documento cumple una media query.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Función que se ejecuta cuando el tamaño de la ventana cambia y cruza el punto de corte.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Añade un listener para el evento 'change' de la media query.
    mql.addEventListener("change", onChange)
    
    // Establece el estado inicial al montar el componente en el cliente.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Función de limpieza: elimina el listener cuando el componente se desmonta para evitar fugas de memoria.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Devuelve `!!isMobile` para asegurar que el valor sea siempre un booleano (`true` o `false`),
  // tratando `undefined` (durante SSR) como `false`.
  return !!isMobile
}

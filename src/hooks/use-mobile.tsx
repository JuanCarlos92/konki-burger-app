import * as React from "react"

// Define el punto de corte para considerar un dispositivo como "móvil".
const MOBILE_BREAKPOINT = 768

/**
 * Hook personalizado para detectar si el dispositivo es móvil basándose en el ancho de la ventana.
 * @returns {boolean} `true` si el ancho de la ventana es menor que `MOBILE_BREAKPOINT`, de lo contrario `false`.
 */
export function useIsMobile() {
  // El estado `isMobile` se inicializa como `undefined` para manejar el renderizado del lado del servidor (SSR),
  // donde el objeto `window` no está disponible.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Media query para detectar cambios en el tamaño de la ventana.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Función que se ejecuta cuando cambia el tamaño de la ventana.
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
  // tratando `undefined` como `false` durante el renderizado inicial del servidor.
  return !!isMobile
}

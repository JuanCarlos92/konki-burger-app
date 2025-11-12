import * as React from 'react';

import {cn} from '@/lib/utils';

/**
 * Componente de área de texto (textarea) reutilizable y estilizado.
 * Proporciona un área de texto con estilos consistentes definidos en el sistema de diseño.
 *
 * @param {React.ComponentProps<'textarea'>} props - Las propiedades estándar de un elemento <textarea>.
 * @param {React.Ref<HTMLTextAreaElement>} ref - Una referencia al elemento textarea subyacente.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          // Clases base para el área de texto
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          // Fusiona con clases personalizadas proporcionadas a través de `className`
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};

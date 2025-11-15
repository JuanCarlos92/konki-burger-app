

/**
 * Componente del pie de página de la aplicación.
 * Muestra información de copyright y un pequeño logo. Es consistente en todo el sitio público.
 */
export function Footer() {
    return (
        <footer className="border-t">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
                <div className="flex items-center gap-2">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        C. el Bierzo, 38320 La Laguna, Santa Cruz de Tenerife
                    </p>
                </div>
                <p className="text-center text-sm text-muted-foreground md:text-right">
                    © {new Date().getFullYear()} Konki Burger. Todos los Derechos Reservados.
                </p>
            </div>
        </footer>
    );
}

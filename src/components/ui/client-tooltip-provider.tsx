"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ClientTooltipProvider({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider>
            {children}
        </TooltipProvider>
    )
}

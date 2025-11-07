import { Menu } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t py-6 md:py-8">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                    <Menu className="h-6 w-6 text-primary" />
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by your favorite burger joint.
                    </p>
                </div>
                <p className="text-center text-sm text-muted-foreground md:text-right">
                    © {new Date().getFullYear()} Konki Burger. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}

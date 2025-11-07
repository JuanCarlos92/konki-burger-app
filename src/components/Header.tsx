"use client";

import Link from "next/link";
import { ShoppingCart, LogIn, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/contexts/AppContext";
import { CartSheet } from "./CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export function Header() {
  const { cartCount, isAuthenticated, logout, currentUser, isAdmin } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Menu className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg sm:inline-block">
            Konki Burger
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Menu
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {isClient && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {cartCount}
                </span>
              )}
            </Button>
          </CartSheet>

          {isClient && isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                    </DropdownMenuItem>
                  </Link>
                 )}
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            isClient && (
                <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost">
                        <Link href="/login">
                            <span className="flex items-center">
                                <LogIn className="mr-2 h-4 w-4" /> Login
                            </span>
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">
                            Register
                        </Link>
                    </Button>
                </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}

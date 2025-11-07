"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, ShoppingBasket, Users, Home, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppContext } from "@/lib/contexts/AppContext";
import { ClientTooltipProvider } from "@/components/ui/client-tooltip-provider";

const navItems = [
  { href: "/admin/orders", icon: ShoppingBasket, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAppContext();

  return (
    <ClientTooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <Menu className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg font-headline">Konki Burger</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
                      <item.icon />
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton>
                      <Home />
                      Back to Site
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                {currentUser && (
                    <SidebarMenuItem>
                      <div className="flex items-center gap-2 p-2">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} />
                              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                              <span className="text-sm font-semibold">{currentUser.name}</span>
                              <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                          </div>
                      </div>
                    </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout}>
                    <LogOut />
                    Logout
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ClientTooltipProvider>
  );
}

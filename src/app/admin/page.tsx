"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/contexts/AppContext";
import { Package, ShoppingBasket, Users } from "lucide-react";
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User, Order, Product } from "@/lib/types";


export default function AdminDashboardPage() {
    const { currentUser } = useAppContext();
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

    const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    const pendingOrders = (orders || []).filter(o => o.status === 'Pending').length;

    const sortedOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [orders]);

    const recentOrders = sortedOrders.slice(0, 5);

    const formatOrderDate = (date: any) => {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return format(d, 'p'); // 'p' is for locale-specific time
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold font-headline mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-6">Welcome back, {currentUser?.name}. Here's what's happening.</p>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingOrders ? '...' : pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">out of {isLoadingOrders ? '...' : (orders?.length || 0)} total orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingProducts ? '...' : products?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">menu items available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingUsers ? '...' : users?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">customers in the system</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders ? <p>Loading recent activity...</p> : 
                        recentOrders.length > 0 ? recentOrders.map(order => (
                             <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div>
                                    <p>New order from <span className="font-semibold">{order.customer.name}</span></p>
                                    <p className="text-sm text-muted-foreground">{order.items.length} items for ${order.total.toFixed(2)}</p>
                                 </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatOrderDate(order.createdAt)}
                                 </div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/lib/contexts/AppContext";
import { Package, ShoppingBasket, Users } from "lucide-react";
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User, Order, Product } from "@/lib/types";

/**
 * Página del panel principal de administración (Dashboard).
 * Muestra un resumen de estadísticas clave como pedidos pendientes, total de productos y usuarios,
 * así como una lista de la actividad reciente (últimos pedidos).
 */
export default function AdminDashboardPage() {
    const { currentUser } = useAppContext();
    const firestore = useFirestore();

    // Hooks para obtener las colecciones de usuarios, pedidos y productos de Firestore en tiempo real.
    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

    const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const productsQuery = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsQuery);

    // Calcula el número de pedidos pendientes filtrando la lista de pedidos.
    const pendingOrders = (orders || []).filter(o => o.status === 'Pending').length;

    /**
     * Memoiza y ordena los pedidos por fecha de creación para mostrar los más recientes primero.
     * `useMemo` optimiza el rendimiento al evitar recalcular en cada render si los datos no cambian.
     */
    const sortedOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Orden descendente.
        });
    }, [orders]);

    // Obtiene los 5 pedidos más recientes para la sección de "Actividad Reciente".
    const recentOrders = sortedOrders.slice(0, 5);

    /**
     * Formatea la fecha de un pedido a un formato de hora legible (ej: "4:30 PM").
     * @param {any} date - El objeto de fecha (Timestamp de Firestore o Date de JS).
     * @returns {string} La hora formateada o un texto indicativo si no es válida.
     */
    const formatOrderDate = (date: any) => {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        if (isNaN(d.getTime())) return 'Fecha Inválida';
        return format(d, 'p'); // 'p' es el formato para la hora local con AM/PM.
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold font-headline mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground mb-6">Bienvenido de nuevo, {currentUser?.name}. Esto es lo que está pasando.</p>

            {/* Tarjetas de estadísticas clave */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                        <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingOrders ? '...' : pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">de {isLoadingOrders ? '...' : (orders?.length || 0)} pedidos totales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productos Totales</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingProducts ? '...' : products?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">artículos disponibles en el menú</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoadingUsers ? '...' : users?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">clientes en el sistema</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tarjeta de actividad reciente */}
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders ? <p>Cargando actividad reciente...</p> : 
                        recentOrders.length > 0 ? recentOrders.map(order => (
                             <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div>
                                    <p>Nuevo pedido de <span className="font-semibold">{order.customer.name}</span></p>
                                    <p className="text-sm text-muted-foreground">{order.items.length} artículos por ${order.total.toFixed(2)}</p>
                                 </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatOrderDate(order.createdAt)}
                                 </div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No hay pedidos recientes.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, Timestamp } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "../components/OrderActions";
import { format } from 'date-fns';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Página de administración para gestionar todos los pedidos de la aplicación.
 * Muestra una tabla con detalles de cada pedido y acciones para aceptarlos o rechazarlos.
 */
export default function AdminOrdersPage() {
  const firestore = useFirestore();
  
  // Obtiene todos los pedidos de la colección 'orders' en Firestore.
  // En una aplicación de producción, sería recomendable implementar paginación aquí.
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);
  
  /**
   * Convierte un valor de fecha (Timestamp de Firestore o Date de JS) a un número (milisegundos).
   * Devuelve 0 si la fecha no es válida para asegurar una ordenación predecible.
   * @param {any} dateValue - El valor de fecha a convertir.
   * @returns {number} El tiempo en milisegundos o 0.
   */
  const getDateAsTimestamp = (dateValue: any): number => {
    if (dateValue instanceof Timestamp) {
      return dateValue.toMillis();
    }
    if (dateValue instanceof Date) {
      return dateValue.getTime();
    }
    // Para strings u otros tipos, intenta crear un objeto Date.
    const date = new Date(dateValue);
    // Devuelve 0 si la fecha resultante no es válida.
    return !isNaN(date.getTime()) ? date.getTime() : 0;
  };
  
  /**
   * Memoiza y ordena los pedidos por fecha de creación, mostrando los más recientes primero.
   * `useMemo` evita que la ordenación se recalcule en cada render si los pedidos no han cambiado.
   */
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
        const dateA = getDateAsTimestamp(a.createdAt);
        const dateB = getDateAsTimestamp(b.createdAt);
        return dateB - dateA; // Orden descendente.
    });
  }, [orders]);

  /**
   * Formatea un objeto de fecha (Timestamp de Firestore o Date de JS) a un string legible.
   * @param {any} date - El objeto de fecha a formatear.
   * @returns {string} La fecha formateada o un texto indicativo si no es válida.
   */
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Los Timestamps de Firestore necesitan convertirse a objetos Date de JS.
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'Fecha Inválida';
    return format(d, 'PPpp'); // Formato con fecha y hora (ej: "Jul 28, 2024, 4:30:00 PM")
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Gestión de Pedidos</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los pedidos de los clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Artículos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora Recogida</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Muestra esqueletos de carga mientras se obtienen los pedidos. */}
              {isOrdersLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                 ))
              // Muestra un mensaje si no hay pedidos.
              ) : sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Aún no hay pedidos.
                  </TableCell>
                </TableRow>
              // Renderiza la lista de pedidos en filas de la tabla.
              ) : (
                sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Muestra un resumen de los artículos del pedido. */}
                      {order.items.map((item: any) => (
                        <div key={item.product.id} className="text-sm">
                          {item.quantity} x {item.product.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {/* La insignia cambia de color según el estado del pedido para una rápida identificación visual. */}
                      <Badge
                        variant={
                          order.status === "Pending"
                            ? "secondary"
                            : order.status === "Accepted"
                            ? "default"
                            : "destructive"
                        }
                        className={order.status === 'Accepted' ? 'bg-green-600' : ''}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      {order.pickupTime || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Componente que contiene los botones de acción (Aceptar/Rechazar). */}
                      <OrderActions order={order} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

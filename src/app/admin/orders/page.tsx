
"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
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

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  
  // Fetch all orders directly in the admin page
  const ordersQuery = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const { data: orders, isLoading: isOrdersLoading } = useCollection<Order>(ordersQuery);
  
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
        // Handle both Firestore Timestamps and JS Dates
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt as any || 0).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt as any || 0).getTime();
        return dateB - dateA;
    });
  }, [orders]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Firestore Timestamps need to be converted to JS Dates
    const d = date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return format(d, 'PPpp'); // Format with date and time
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Order Management</CardTitle>
          <CardDescription>
            View and manage all incoming customer orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Pickup Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isOrdersLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                 ))
              ) : sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No orders yet.
                  </TableCell>
                </TableRow>
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

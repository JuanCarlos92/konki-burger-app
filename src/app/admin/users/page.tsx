"use client";

import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActions } from "../components/UserActions";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Página de administración para gestionar todos los usuarios registrados en la aplicación.
 * Muestra una tabla con la información de cada usuario y permite realizar acciones sobre ellos.
 */
export default function AdminUsersPage() {
  const firestore = useFirestore();
  // Obtiene la colección de usuarios de Firestore en tiempo real.
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersQuery);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Gestión de Usuarios</CardTitle>
          <CardDescription>
            Visualiza y gestiona todos los usuarios registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Muestra esqueletos de carga mientras se obtienen los datos de los usuarios. */}
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              // Muestra un mensaje si no hay usuarios registrados.
              ) : !users || users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        No se encontraron usuarios.
                    </TableCell>
                </TableRow>
              // Renderiza la tabla de usuarios.
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {/* Usa un servicio de avatares (avatar.vercel.sh) basado en el hash del email para generar una imagen de perfil única. */}
                          <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.address}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Componente que contiene los botones de acción para el usuario (p.ej., Eliminar, Restablecer Contraseña). */}
                      <UserActions user={user} />
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

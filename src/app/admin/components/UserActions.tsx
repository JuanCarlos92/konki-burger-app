"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/contexts/AppContext";

/**
 * Componente que renderiza los botones de acción para un usuario (Resetear Contraseña, Eliminar).
 * @param {object} props - Propiedades del componente.
 * @param {User} props.user - El objeto del usuario sobre el cual actuar.
 */
export function UserActions({ user }: { user: User }) {
  const { toast } = useToast();
  const { deleteUser } = useAppContext();
  
  // El estado de administrador ahora se basa en el email, por lo que podemos comprobarlo directamente.
  // Esto evita la eliminación de la cuenta de administrador principal.
  const isUserAdmin = user.email === 'konkiburger@gmail.com';

  /**
   * Maneja la eliminación de un usuario.
   * Evita que la cuenta de administrador principal sea eliminada.
   */
  const handleDelete = () => {
    if (isUserAdmin) {
      toast({ variant: "destructive", title: "Acción Prohibida", description: "No se puede eliminar la cuenta de administrador principal." });
      return;
    }
    deleteUser(user.id);
    toast({ variant: "destructive", title: "Usuario Eliminado", description: `"${user.name}" ha sido eliminado del sistema.` });
  };
  
  /**
   * Simula el envío de un correo para restablecer la contraseña.
   * En una aplicación real, esto activaría un servicio de correo electrónico.
   */
  const handlePasswordReset = () => {
    toast({ title: "Contraseña Restablecida", description: `Se ha enviado un enlace para restablecer la contraseña a ${user.email}. (Esto es una simulación)` });
  };

  return (
    <div className="flex gap-2 justify-end">
      {/* Botón para simular el restablecimiento de contraseña */}
      <Button size="sm" variant="outline" onClick={handlePasswordReset}>
        Restablecer Contraseña
      </Button>
      
      {/* Diálogo de confirmación para eliminar el usuario */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {/* El botón de eliminar se deshabilita si el usuario es el administrador principal */}
          <Button size="sm" variant="destructive" disabled={isUserAdmin}>
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta de usuario de "{user.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { errorEmitter } from "@/firebase";

/**
 * Componente que renderiza los botones de acción para un usuario en la tabla de administración:
 * `Restablecer Contraseña` y `Eliminar`.
 * @param {object} props - Propiedades del componente.
 * @param {User} props.user - El objeto del usuario sobre el cual se realizarán las acciones.
 */
export function UserActions({ user }: { user: User }) {
  const { toast } = useToast();
  const { deleteUser } = useAppContext();
  
  // El estado de administrador ahora se basa en un email específico (`konkiburger@gmail.com`).
  // Esta comprobación evita la eliminación o acciones no deseadas sobre la cuenta de administrador principal.
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
   * Envía un correo electrónico para restablecer la contraseña utilizando Firebase Authentication.
   * Esta función es una característica integrada de Firebase y no requiere configuración de servidor de correo.
   */
  const handlePasswordReset = () => {
    const auth = getAuth(); // Obtiene la instancia del servicio de autenticación.
    sendPasswordResetEmail(auth, user.email)
      .then(() => {
        // Muestra una notificación de éxito si el correo se envía correctamente.
        toast({
          title: "Correo de Restablecimiento Enviado",
          description: `Se ha enviado un enlace para restablecer la contraseña a ${user.email}.`,
        });
      })
      .catch((error) => {
        // En caso de error (p.ej., usuario no encontrado), lo muestra en la consola y emite un evento de error.
        console.error("Error al enviar el correo de restablecimiento:", error);
        errorEmitter.emit('permission-error', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo enviar el correo de restablecimiento.",
        });
      });
  };

  return (
    <div className="flex gap-2 justify-end">
      {/* Botón para enviar el correo de restablecimiento de contraseña. */}
      <Button size="sm" variant="outline" onClick={handlePasswordReset}>
        Restablecer Contraseña
      </Button>
      
      {/* Diálogo de confirmación para eliminar el usuario, evitando acciones accidentales. */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {/* El botón de eliminar se deshabilita si el usuario es el administrador principal. */}
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

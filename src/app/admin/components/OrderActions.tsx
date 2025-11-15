"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/lib/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/types";

/**
 * Componente que renderiza los botones de acción para un pedido (`Aceptar` o `Rechazar`).
 * Solo muestra acciones si el estado del pedido es "Pendiente". En otros casos, muestra el estado actual.
 * @param {object} props - Propiedades del componente.
 * @param {Order} props.order - El objeto del pedido sobre el cual se realizarán las acciones.
 */
export function OrderActions({ order }: { order: Order }) {
  // Hooks para gestionar el estado, el contexto de la aplicación y las notificaciones.
  const { updateOrderStatus } = useAppContext();
  const { toast } = useToast();
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [pickupTime, setPickupTime] = useState("");

  /**
   * Maneja la acción de aceptar un pedido.
   * Valida que se haya introducido una hora de recogida, llama a la función del contexto para
   * actualizar el estado del pedido y cierra el diálogo.
   */
  const handleAccept = () => {
    if (!pickupTime) {
      toast({ variant: "destructive", title: "Por favor, introduce una hora de recogida." });
      return;
    }
    // Llama a la función del contexto para actualizar el estado. La lógica de notificaciones y
    // envío de correo se gestiona dentro de `updateOrderStatus`.
    updateOrderStatus(order.id, "Accepted", order.customer.email, pickupTime);
    
    // Cierra el diálogo y resetea el estado local.
    setIsAcceptDialogOpen(false);
    setPickupTime("");
  };

  /**
   * Maneja la acción de rechazar un pedido.
   */
  const handleReject = () => {
    updateOrderStatus(order.id, "Rejected", order.customer.email);
  };

  // Si el estado del pedido no es "Pendiente", no se muestran acciones.
  // En su lugar, se muestra el estado actual con un color distintivo.
  if (order.status !== "Pending") {
    return (
      <span className={`text-sm font-semibold ${order.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
        {order.status}
      </span>
    );
  }

  // Si el pedido está pendiente, muestra los botones de acción.
  return (
    <>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-500" 
          onClick={() => setIsAcceptDialogOpen(true)}
        >
          Aceptar
        </Button>
        <Button size="sm" variant="destructive" onClick={handleReject}>
          Rechazar
        </Button>
      </div>

      {/* Diálogo modal para introducir la hora de recogida al aceptar un pedido. */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Establecer Hora de Recogida</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pickup-time" className="text-right">
                Hora
              </Label>
              <Input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="button" onClick={handleAccept}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

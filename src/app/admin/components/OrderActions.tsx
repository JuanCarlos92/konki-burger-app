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

export function OrderActions({ order }: { order: Order }) {
  const { updateOrderStatus } = useAppContext();
  const { toast } = useToast();
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [pickupTime, setPickupTime] = useState("");

  const handleAccept = () => {
    if (!pickupTime) {
      toast({ variant: "destructive", title: "Please enter a pickup time." });
      return;
    }
    // The toast notification is now handled within updateOrderStatus
    updateOrderStatus(order.id, "Accepted", order.customer.email, pickupTime);
    setIsAcceptDialogOpen(false);
    setPickupTime("");
  };

  const handleReject = () => {
    updateOrderStatus(order.id, "Rejected", order.customer.email);
  };

  if (order.status !== "Pending") {
    return (
      <span className={`text-sm font-semibold ${order.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
        {order.status}
      </span>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={() => setIsAcceptDialogOpen(true)}>
          Accept
        </Button>
        <Button size="sm" variant="destructive" onClick={handleReject}>
          Reject
        </Button>
      </div>

      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Pickup Time</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pickup-time" className="text-right">
                Time
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
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAccept}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function UserActions({ user }: { user: User }) {
  const { toast } = useToast();
  const { deleteUser } = useAppContext();
  const firestore = useFirestore();

  // Check if the user being acted on has an admin role
  const adminRoleRef = useMemoFirebase(() => doc(firestore, 'roles_admin', user.id), [firestore, user.id]);
  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  const handleDelete = () => {
    if (adminRoleDoc) {
      toast({ variant: "destructive", title: "Action Forbidden", description: "Cannot delete an admin account." });
      return;
    }
    deleteUser(user.id);
    toast({ variant: "destructive", title: "User Deleted", description: `${user.name} has been removed from the system.` });
  };
  
  const handlePasswordReset = () => {
    // This is a mock action. In a real app, this would trigger an email.
    toast({ title: "Password Reset", description: `A password reset link has been sent to ${user.email}. (This is a simulation)` });
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="outline" onClick={handlePasswordReset}>
        Reset Password
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isAdminRoleLoading || !!adminRoleDoc}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for "{user.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

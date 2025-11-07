
"use client";

import { AdminSidebar } from "./components/AdminSidebar";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { doc } from "firebase/firestore";
import { Loader } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  // This combines all loading states into one.
  const isLoading = isUserLoading || isAdminRoleLoading;

  useEffect(() => {
    // If still loading, do nothing. Let the loading UI render.
    if (isLoading) {
      return;
    }
    // If loading is finished and there's no authenticated user, redirect to login.
    if (!user) {
      router.replace('/login');
    }
    // No need for another condition, the rendering logic below will handle the access denied case.
  }, [user, isLoading, router]);


  // 1. Show a loading state while we verify authentication and authorization
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold font-headline">Verifying Access...</h1>
            <p className="text-muted-foreground">Please wait while we check your credentials.</p>
        </div>
    )
  }

  // 2. If loading is complete, and the user is an admin, render the layout.
  if (user && adminRoleDoc) {
    return (
        <AdminSidebar>
          {children}
        </AdminSidebar>
    );
  }

  // 3. If loading is complete, but user is not an admin or not logged in, show Access Denied.
  // This covers the case where `user` is null or `adminRoleDoc` is null after loading.
  return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-3xl font-bold font-headline mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to view this page. Please log in with an admin account.</p>
          <Button asChild>
              <Link href="/">Return to Home</Link>
          </Button>
      </div>
  );
}

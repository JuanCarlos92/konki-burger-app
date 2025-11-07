
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PRODUCTS, CATEGORIES } from '@/lib/static-data';
import { useToast } from '@/hooks/use-toast';

export function DataSeeder() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedFinished, setSeedFinished] = useState(false);

  useEffect(() => {
    const seedData = async () => {
      // Prevent re-seeding
      const seedStatus = localStorage.getItem('seed_status');
      if (seedStatus === 'done' || isSeeding || seedFinished) {
        return;
      }
      
      setIsSeeding(true);

      try {
        const productsSnap = await getDocs(collection(firestore, 'products'));
        const categoriesSnap = await getDocs(collection(firestore, 'categories'));

        if (!productsSnap.empty && !categoriesSnap.empty) {
          localStorage.setItem('seed_status', 'done');
          setSeedFinished(true);
          setIsSeeding(false);
          return;
        }

        toast({
          title: "Setting up database...",
          description: "Please wait, we're populating the app with initial data.",
        });

        const batch = writeBatch(firestore);
        
        if (productsSnap.empty) {
          console.log('Seeding products...');
          PRODUCTS.forEach(product => {
            batch.set(doc(firestore, 'products', product.id), product);
          });
        }
        
        if (categoriesSnap.empty) {
          console.log('Seeding categories...');
          CATEGORIES.forEach(category => {
            batch.set(doc(firestore, 'categories', category.id), category);
          });
        }

        batch.commit().catch((error) => {
          const contextualError = new FirestorePermissionError({
            path: 'products/categories',
            operation: 'write',
            requestResourceData: 'Initial batch of products and categories'
          });
          errorEmitter.emit('permission-error', contextualError);
        });

        console.log('Database public data seeding completed.');
        toast({
          title: "Setup Complete!",
          description: "The application's public data is ready.",
        });
        localStorage.setItem('seed_status', 'done');
        setSeedFinished(true);

      } catch (error: any) {
         // This will catch errors from getDocs if rules are incorrect for reading
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products or categories',
            operation: 'list',
         }));
         toast({
          variant: "destructive",
          title: "Database setup failed",
          description: "Could not read initial collections. Check Firestore rules.",
        });
      } finally {
        setIsSeeding(false);
      }
    };

    if (firestore && !isSeeding && !seedFinished) {
      seedData();
    }
  }, [firestore, isSeeding, seedFinished, toast]);

  return null; // This component does not render anything
}

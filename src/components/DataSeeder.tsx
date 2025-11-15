
"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PRODUCTS, CATEGORIES } from '@/lib/static-data';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/lib/contexts/AppContext';

/**
 * Componente "invisible" que se encarga de sembrar (poblar) la base de datos con datos iniciales.
 * Si las colecciones de `products` y `categories` están vacías, las puebla con los datos estáticos
 * definidos en `src/lib/static-data.ts`.
 * 
 * Esta operación se realiza solo una vez y únicamente por un usuario administrador para evitar
 * errores de permisos para visitantes no autenticados.
 */
export function DataSeeder() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAppContext();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    /**
     * Función asíncrona para comprobar si la base de datos necesita datos iniciales y sembrarlos.
     */
    const seedData = async () => {
      // CRÍTICO: Solo el administrador puede intentar poblar la base de datos.
      if (!isAdmin) {
        return;
      }
      
      const seedStatus = localStorage.getItem('seed_status');
      if (seedStatus === 'done' || isSeeding) {
        return;
      }
      
      setIsSeeding(true);

      try {
        const productsSnap = await getDocs(collection(firestore, 'products'));
        const categoriesSnap = await getDocs(collection(firestore, 'categories'));

        if (!productsSnap.empty && !categoriesSnap.empty) {
          localStorage.setItem('seed_status', 'done');
          setIsSeeding(false);
          return;
        }

        console.log('Iniciando siembra de datos...');
        const batch = writeBatch(firestore);
        
        if (productsSnap.empty) {
          console.log('Sembrando productos...');
          PRODUCTS.forEach(product => {
            const productRef = doc(collection(firestore, 'products'));
            batch.set(productRef, product);
          });
        }
        
        if (categoriesSnap.empty) {
            console.log('Sembrando categorías...');
            CATEGORIES.forEach(category => {
                // Usamos el ID de la categoría como ID del documento para consistencia.
                const categoryRef = doc(firestore, 'categories', category.id);
                batch.set(categoryRef, category);
            });
        }
        
        await batch.commit();

        console.log('Siembra de la base de datos completada.');
        toast({
          title: "Base de Datos Poblada",
          description: "Los productos y categorías iniciales se han cargado.",
        });
        localStorage.setItem('seed_status', 'done');

      } catch (error: any) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products o categories',
            operation: 'list',
         }));
         toast({
          variant: "destructive",
          title: "Fallo en la siembra de datos",
          description: "No se pudieron escribir los datos iniciales. Comprueba las reglas de Firestore.",
        });
      } finally {
        setIsSeeding(false);
      }
    };

    // Solo ejecuta la lógica si firestore y el estado de admin están listos.
    if (firestore && isAdmin !== undefined && !isSeeding) {
        seedData();
    }
  }, [firestore, isAdmin, isSeeding, toast]);

  // Este componente no renderiza nada visible en la UI.
  return null;
}

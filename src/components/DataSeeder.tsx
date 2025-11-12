"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PRODUCTS, CATEGORIES } from '@/lib/static-data';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente "invisible" que se encarga de sembrar la base de datos con datos iniciales (productos y categorías).
 * Se ejecuta una sola vez al cargar la aplicación y solo si las colecciones correspondientes están vacías.
 */
export function DataSeeder() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedFinished, setSeedFinished] = useState(false);

  useEffect(() => {
    /**
     * Función asíncrona para comprobar y sembrar los datos.
     */
    const seedData = async () => {
      // Usa localStorage para evitar intentar sembrar datos repetidamente en la misma sesión de navegador.
      const seedStatus = localStorage.getItem('seed_status');
      if (seedStatus === 'done' || isSeeding || seedFinished) {
        return;
      }
      
      setIsSeeding(true);

      try {
        // Comprueba si las colecciones 'products' y 'categories' ya tienen datos.
        const productsSnap = await getDocs(collection(firestore, 'products'));
        const categoriesSnap = await getDocs(collection(firestore, 'categories'));

        // Si ambas colecciones tienen datos, marca el proceso como finalizado y no hace nada más.
        if (!productsSnap.empty && !categoriesSnap.empty) {
          localStorage.setItem('seed_status', 'done');
          setSeedFinished(true);
          setIsSeeding(false);
          return;
        }

        toast({
          title: "Configurando la base de datos...",
          description: "Por favor, espera, estamos poblando la aplicación con datos iniciales.",
        });

        // Usa un 'write batch' para realizar todas las escrituras en una sola operación atómica.
        const batch = writeBatch(firestore);
        
        // Si la colección de productos está vacía, la puebla.
        if (productsSnap.empty) {
          console.log('Sembrando productos...');
          PRODUCTS.forEach(product => {
            batch.set(doc(firestore, 'products', product.id), product);
          });
        }
        
        // Si la colección de categorías está vacía, la puebla.
        if (categoriesSnap.empty) {
          console.log('Sembrando categorías...');
          CATEGORIES.forEach(category => {
            batch.set(doc(firestore, 'categories', category.id), category);
          });
        }

        // Ejecuta el batch. Si falla, emite un error de permisos.
        await batch.commit().catch(() => {
          const contextualError = new FirestorePermissionError({
            path: 'products/categories',
            operation: 'write',
            requestResourceData: 'Lote inicial de productos y categorías'
          });
          errorEmitter.emit('permission-error', contextualError);
        });

        console.log('Siembra de datos públicos de la base de datos completada.');
        toast({
          title: "¡Configuración Completa!",
          description: "Los datos públicos de la aplicación están listos.",
        });
        localStorage.setItem('seed_status', 'done');
        setSeedFinished(true);

      } catch (error: any) {
         // Captura errores de `getDocs` si las reglas de Firestore no permiten la lectura.
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products o categories',
            operation: 'list',
         }));
         toast({
          variant: "destructive",
          title: "Fallo en la configuración de la base de datos",
          description: "No se pudieron leer las colecciones iniciales. Comprueba las reglas de Firestore.",
        });
      } finally {
        setIsSeeding(false);
      }
    };

    // Ejecuta la siembra solo si Firestore está disponible y no se ha hecho antes.
    if (firestore && !isSeeding && !seedFinished) {
      seedData();
    }
  }, [firestore, isSeeding, seedFinished, toast]);

  // Este componente no renderiza nada en la interfaz de usuario.
  return null;
}

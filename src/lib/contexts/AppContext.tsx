"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    collection, 
    doc, 
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    setDoc,
    writeBatch,
    getDocs,
    getDoc,
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    type User as FirebaseUser
} from 'firebase/auth';

import { useFirestore, useAuth, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { Product, CartItem, Order, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sendConfirmationEmailAction } from '@/app/actions/send-email';

/**
 * Helper para obtener el carrito de invitados desde localStorage.
 * Devuelve un array vacío si no se encuentra o hay un error.
 */
const getGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = window.localStorage.getItem('guestCart');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.warn(`Error al leer guestCart de localStorage:`, error);
    return [];
  }
};

/**
 * Define la forma del contexto de la aplicación.
 * Incluye el estado del carrito, pedidos, autenticación y acciones para manipularlos.
 */
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'| 'total' | 'items' | 'userId'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], customerEmail: string, pickupTime?: string) => void;
  isAuthenticated: boolean;
  login: (email:string, password:string) => Promise<any>;
  logout: () => void;
  currentUser: User | null;
  isUserLoading: boolean;
  register: (name: string, email: string, address: string, password: string) => Promise<any>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, product: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  deleteUser: (userId: string) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Proveedor del contexto de la aplicación.
 * Centraliza el estado y la lógica de negocio de la aplicación.
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const userProfileRef = useMemoFirebase(() => firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, [firebaseUser, firestore]);
  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<User>(userProfileRef);

  const isAdmin = useMemo(() => firebaseUser?.email === 'konkiburger@gmail.com', [firebaseUser]);
  
  /**
   * Carga el carrito del usuario desde Firestore.
   */
  const loadCartFromFirestore = useCallback(async (uid: string) => {
    setIsCartLoading(true);
    try {
      const cartCollectionRef = collection(firestore, `users/${uid}/cart`);
      const cartSnapshot = await getDocs(cartCollectionRef);
      // Implementación más robusta para obtener detalles completos del producto
      const productPromises = cartSnapshot.docs.map(d => getDoc(doc(firestore, 'products', d.id)));
      const productDocs = await Promise.all(productPromises);

      const dbCart: CartItem[] = [];
      cartSnapshot.docs.forEach((d, index) => {
        const productDoc = productDocs[index];
        if (productDoc.exists()) {
          dbCart.push({ product: { id: productDoc.id, ...productDoc.data() } as Product, quantity: d.data().quantity });
        }
      });
      setCart(dbCart);
    } catch (e) {
      console.error("Error al cargar el carrito desde Firestore:", e);
    } finally {
      setIsCartLoading(false);
    }
  }, [firestore]);


  /**
   * Fusiona el carrito de invitado (de localStorage) con el carrito de Firestore al iniciar sesión.
   */
  const mergeAndClearGuestCart = useCallback(async (uid: string) => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    try {
      const userCartRef = collection(firestore, 'users', uid, 'cart');
      const batch = writeBatch(firestore);

      const userCartSnap = await getDocs(userCartRef);
      const userCartItems: { [productId: string]: number } = {};
      userCartSnap.forEach(doc => { userCartItems[doc.id] = doc.data().quantity; });

      guestCart.forEach(item => {
        const newQuantity = (userCartItems[item.product.id] || 0) + item.quantity;
        batch.set(doc(userCartRef, item.product.id), { quantity: newQuantity, productId: item.product.id });
      });

      await batch.commit();
      window.localStorage.removeItem('guestCart');
      await loadCartFromFirestore(uid);
    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${uid}/cart`, operation: 'write', requestResourceData: "Fusión de carrito de invitado" }));
    }
  }, [firestore, loadCartFromFirestore]);

  /**
   * Efecto que se ejecuta cuando cambia el estado de autenticación.
   */
  useEffect(() => {
    if (firebaseUser) {
      mergeAndClearGuestCart(firebaseUser.uid).then(() => loadCartFromFirestore(firebaseUser.uid));
    } else {
      setCart(getGuestCart());
      setIsCartLoading(false);
    }
  }, [firebaseUser, loadCartFromFirestore, mergeAndClearGuestCart]);
  
  /**
   * Guarda el carrito en localStorage para usuarios invitados.
   */
  useEffect(() => {
    if (!firebaseUser) {
        localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, firebaseUser]);

  /**
   * Efecto para gestionar el perfil del usuario en Firestore.
   */
  useEffect(() => {
    if (userProfileData) {
      setCurrentUser(userProfileData);
    } else if (!isUserProfileLoading && firebaseUser) {
      createFirestoreUser(firebaseUser, firebaseUser.displayName, 'Dirección no establecida');
    }
  }, [userProfileData, isUserProfileLoading, firebaseUser]);

  const isAuthenticated = !!firebaseUser;
  const isUserLoading = !!(isAuthLoading || (firebaseUser && (isUserProfileLoading || isCartLoading)));
  
  /**
   * Crea un documento de perfil de usuario en Firestore si no existe.
   */
  const createFirestoreUser = async (user: FirebaseUser, name?: string | null, address?: string | null) => {
    const userRef = doc(firestore, "users", user.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setCurrentUser(userDoc.data() as User);
        return;
      }
      const newUserProfile: Omit<User, 'id'> = {
        name: name || user.displayName || user.email?.split('@')[0] || "Nuevo Usuario",
        email: user.email!,
        address: address || "No proporcionada",
      };
      await setDoc(userRef, newUserProfile);
      setCurrentUser({ id: user.uid, ...newUserProfile });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${user.uid}`, operation: 'create', requestResourceData: { name, email: user.email } }));
    }
  };

  /**
   * Inicia sesión de un usuario.
   * @param {string} email - Email del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<any>} Las credenciales del usuario.
   */
  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createFirestoreUser(userCredential.user);
    return userCredential;
  };
  
  /**
   * Registra un nuevo usuario.
   * @param {string} name - Nombre del usuario.
   * @param {string} email - Email del usuario.
   * @param {string} address - Dirección del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<any>} Las credenciales del usuario.
   */
  const register = async (name: string, email: string, address: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createFirestoreUser(userCredential.user, name, address);
    return userCredential;
  };

  /**
   * Cierra la sesión del usuario.
   */
  const logout = () => {
    signOut(auth).then(() => {
        setCurrentUser(null);
        setCart([]);
    });
  };

  /**
   * Añade un producto al carrito o incrementa su cantidad.
   * @param {Product} product - El producto a añadir.
   * @param {number} [quantity=1] - La cantidad a añadir.
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    const newQuantity = (cart.find(item => item.product.id === product.id)?.quantity || 0) + quantity;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prevCart, { product, quantity }];
    });
    if (firebaseUser) {
      const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, product.id);
      setDoc(cartItemRef, { quantity: newQuantity, productId: product.id }, { merge: true })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: cartItemRef.path, operation: 'write', requestResourceData: { quantity: newQuantity } }));
          loadCartFromFirestore(firebaseUser.uid);
        });
    }
  };

  /**
   * Elimina un producto del carrito.
   * @param {string} productId - El ID del producto a eliminar.
   */
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
     if (firebaseUser) {
        const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, productId);
        deleteDoc(cartItemRef)
          .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: cartItemRef.path, operation: 'delete' }));
            loadCartFromFirestore(firebaseUser.uid);
          });
    }
  };

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param {string} productId - El ID del producto a actualizar.
   * @param {number} quantity - La nueva cantidad.
   */
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => item.product.id === productId ? { ...item, quantity } : item));
    if (firebaseUser) {
      const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, productId);
      setDoc(cartItemRef, { quantity }, { merge: true })
        .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: cartItemRef.path, operation: 'update', requestResourceData: { quantity } }));
            loadCartFromFirestore(firebaseUser.uid);
        });
    }
  };

  /**
   * Limpia el carrito.
   */
  const clearCart = () => {
    setCart([]);
     if (firebaseUser) {
        const cartCollectionRef = collection(firestore, `users/${firebaseUser.uid}/cart`);
        getDocs(cartCollectionRef).then(snapshot => {
            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            batch.commit()
              .catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: cartCollectionRef.path, operation: 'delete' }));
                loadCartFromFirestore(firebaseUser.uid);
              });
        })
    }
  };

  // Memoiza el cálculo del total y la cantidad de artículos del carrito.
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  /**
   * Crea un nuevo pedido en Firestore.
   * @param {Omit<Order, 'id' | 'createdAt' | 'status'| 'total' | 'items' | 'userId'>} orderData - Datos del cliente para el pedido.
   */
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'| 'total' | 'items' | 'userId'>) => {
    const commonOrderData = { createdAt: serverTimestamp(), status: 'Pending', items: cart, total: cartTotal, ...orderData };
    if (firebaseUser) {
      const batch = writeBatch(firestore);
      const publicOrderRef = doc(collection(firestore, 'orders'));
      const userOrderRef = doc(firestore, `users/${firebaseUser.uid}/orders`, publicOrderRef.id);
      const newOrderData = { ...commonOrderData, userId: firebaseUser.uid };
      batch.set(publicOrderRef, newOrderData);
      batch.set(userOrderRef, newOrderData);
      batch.commit().catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `orders/${publicOrderRef.id}`, operation: 'create', requestResourceData: newOrderData })));
    } else {
      const publicOrderRef = collection(firestore, 'orders');
      const newOrderData = { ...commonOrderData, userId: 'guest' };
      addDoc(publicOrderRef, newOrderData).catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'orders', operation: 'create', requestResourceData: newOrderData })));
    }
  };

  /**
   * Actualiza el estado de un pedido y envía un correo de confirmación.
   * @param {string} orderId - El ID del pedido.
   * @param {Order['status']} status - El nuevo estado ('Accepted' o 'Rejected').
   * @param {string} customerEmail - El email del cliente para la notificación.
   * @param {string} [pickupTime] - La hora de recogida, si el pedido es aceptado.
   */
  const updateOrderStatus = async (orderId: string, status: Order['status'], customerEmail: string, pickupTime?: string) => {
    const publicOrderRef = doc(firestore, 'orders', orderId);
    
    try {
        const orderSnap = await getDoc(publicOrderRef);
        if (!orderSnap.exists()) {
            throw new Error("Pedido no encontrado");
        }
        
        // Prepara los datos del pedido para actualizar y para el correo
        const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
        const userId = orderData.userId;
        const batch = writeBatch(firestore);
        const updateData: any = { status };

        if (pickupTime) {
            updateData.pickupTime = pickupTime;
            orderData.pickupTime = pickupTime; // Añade al objeto para el correo
        }

        // Actualiza el pedido en la colección pública y en la del usuario si existe
        batch.update(publicOrderRef, updateData);
        if (userId && userId !== 'guest') {
            const userOrderRef = doc(firestore, `users/${userId}/orders`, orderId);
            batch.update(userOrderRef, updateData);
        }

        // Ejecuta la escritura en la base de datos
        await batch.commit();

        // Si se acepta, intenta enviar el correo
        if (status === "Accepted") {
            const emailResult = await sendConfirmationEmailAction(orderData);
            if (emailResult.success) {
                toast({ 
                    title: "¡Pedido Aceptado!", 
                    description: `Hora de recogida: ${pickupTime}. Se ha enviado una notificación por correo.`
                });
            } else {
                 toast({ 
                    variant: "destructive",
                    title: "Pedido Aceptado, pero el correo falló", 
                    description: `El pedido está confirmado, pero hubo un problema al enviar el correo. Revisa la configuración. (Error: ${emailResult.message})`
                });
            }
        } else if (status === "Rejected") {
            toast({
                variant: "destructive",
                title: "Pedido Rechazado",
                description: `Se ha rechazado el pedido.`,
            });
        }
    } catch (error) {
        // Captura errores de base de datos o de la acción de correo
        console.error("No se pudo actualizar el estado del pedido o enviar el correo.", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `orders/${orderId}`,
            operation: 'update',
        }));
        toast({
          variant: "destructive",
          title: "Actualización Fallida",
          description: "No se pudo actualizar el pedido. Comprueba los permisos o las extensiones del navegador.",
        });
    }
  };
  
  /**
   * Añade un nuevo producto a Firestore.
   * @param {Omit<Product, 'id'>} productData - Datos del producto sin el ID.
   */
  const addProduct = (productData: Omit<Product, 'id'>) => {
    addDoc(collection(firestore, 'products'), productData).catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create', requestResourceData: productData })));
  }
  
  /**
   * Actualiza un producto existente en Firestore.
   * @param {string} productId - ID del producto a actualizar.
   * @param {Partial<Product>} productData - Datos parciales del producto a actualizar.
   */
  const updateProduct = (productId: string, productData: Partial<Product>) => {
    updateDoc(doc(firestore, 'products', productId), productData).catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${productId}`, operation: 'update', requestResourceData: productData })));
  }

  /**
   * Elimina un producto de Firestore.
   * @param {string} productId - ID del producto a eliminar.
   */
  const deleteProduct = (productId: string) => {
    deleteDoc(doc(firestore, 'products', productId)).catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${productId}`, operation: 'delete' })));
  }
  
  /**
   * Elimina un usuario de Firestore.
   * @param {string} userId - ID del usuario a eliminar.
   */
  const deleteUser = (userId: string) => {
    deleteDoc(doc(firestore, 'users', userId)).catch(error => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${userId}`, operation: 'delete' })));
  }

  // Objeto de valor del contexto que se pasa a los componentes hijos.
  const value: AppContextType = {
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
    addOrder, updateOrderStatus,
    isAuthenticated, login, logout, currentUser, isUserLoading, register,
    addProduct, updateProduct, deleteProduct, deleteUser,
    isAdmin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook para acceder fácilmente al contexto de la aplicación.
 * @returns {AppContextType} El valor del contexto de la aplicación.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};
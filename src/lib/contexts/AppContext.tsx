
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
    query,
    limit
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

// Helper to get data from localStorage for guests
const getGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = window.localStorage.getItem('guestCart');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.warn(`Error reading guestCart from localStorage:`, error);
    return [];
  }
};

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firebaseUser, firestore]);
  const { data: userProfileData, isLoading: isUserProfileLoading } = useDoc<User>(userProfileRef);

  // Admin status is now based on email, so we don't need to check roles_admin collection.
  const isAdmin = useMemo(() => firebaseUser?.email === 'konkiburger@gmail.com', [firebaseUser]);
  
  // Load cart from Firestore for logged-in user
  const loadCartFromFirestore = useCallback(async (uid: string) => {
    setIsCartLoading(true);
    try {
      const cartCollectionRef = collection(firestore, `users/${uid}/cart`);
      const cartSnapshot = await getDocs(cartCollectionRef);
      if (cartSnapshot.empty) {
        setCart([]);
        setIsCartLoading(false);
        return;
      }
      
      const productIds = cartSnapshot.docs.map(d => d.id);
      const productsRef = collection(firestore, 'products');
      const productQuery = query(productsRef);
      const productSnap = await getDocs(productQuery);

      const allProducts = productSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = { id: doc.id, ...doc.data() } as Product;
        return acc;
      }, {} as {[key: string]: Product});

      const dbCart: CartItem[] = [];
      cartSnapshot.forEach(doc => {
          const product = allProducts[doc.id];
          if (product) {
              dbCart.push({ product, quantity: doc.data().quantity });
          }
      });

      setCart(dbCart);
    } catch (e) {
      console.error("Error loading cart from Firestore:", e);
      // Let's keep the local cart as a fallback
    } finally {
      setIsCartLoading(false);
    }
  }, [firestore]);


  const mergeAndClearGuestCart = useCallback(async (uid: string) => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    try {
      const userCartRef = collection(firestore, 'users', uid, 'cart');
      const batch = writeBatch(firestore);

      // We need to fetch the user's current cart to merge correctly
      const userCartSnap = await getDocs(userCartRef);
      const userCartItems: { [productId: string]: number } = {};
      userCartSnap.forEach(doc => {
        userCartItems[doc.id] = doc.data().quantity;
      });

      guestCart.forEach(item => {
        const existingQuantity = userCartItems[item.product.id] || 0;
        const newQuantity = existingQuantity + item.quantity;
        const itemRef = doc(userCartRef, item.product.id);
        batch.set(itemRef, { quantity: newQuantity, productId: item.product.id });
      });

      await batch.commit();
      
      // Clear guest cart from local storage
      window.localStorage.removeItem('guestCart');
      
      // Reload cart from firestore to reflect merged state
      await loadCartFromFirestore(uid);

    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${uid}/cart`,
          operation: 'write',
          requestResourceData: "Guest cart merge"
        }));
    }
  }, [firestore, loadCartFromFirestore]);

  // Effect to handle auth changes
  useEffect(() => {
    if (firebaseUser) {
      // User is logged in
      mergeAndClearGuestCart(firebaseUser.uid).then(() => {
          loadCartFromFirestore(firebaseUser.uid);
      });
    } else {
      // User is logged out or guest
      setCart(getGuestCart());
      setIsCartLoading(false);
    }
  }, [firebaseUser, loadCartFromFirestore, mergeAndClearGuestCart]);
  

  useEffect(() => {
    if (!firebaseUser) {
        localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, firebaseUser]);


  useEffect(() => {
    if (userProfileData) {
      setCurrentUser(userProfileData);
    } else if (!isUserProfileLoading && firebaseUser) {
      // If the profile isn't loading but the firebase user exists, it means the profile doesn't exist in Firestore.
      // We should create it.
      createFirestoreUser(firebaseUser, firebaseUser.displayName, 'Address not set');
    }
  }, [userProfileData, isUserProfileLoading, firebaseUser]);

  const isAuthenticated = !!firebaseUser;
  const isUserLoading = !!(isAuthLoading || (firebaseUser && (isUserProfileLoading || isCartLoading)));
  
  const createFirestoreUser = async (user: FirebaseUser, name?: string | null, address?: string | null) => {
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // If user profile exists, just load it into state.
      setCurrentUser(userDoc.data() as User);
      return; 
    }

    const newUserProfile: Omit<User, 'id'> = {
      name: name || user.displayName || user.email?.split('@')[0] || "New User",
      email: user.email!,
      address: address || "Not provided",
    };

    try {
      await setDoc(userRef, newUserProfile);
      setCurrentUser({ id: user.uid, ...newUserProfile });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `users/${user.uid}`,
        operation: 'create',
        requestResourceData: { newUserProfile }
      }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // After successful login, ensure Firestore user exists
    await createFirestoreUser(userCredential.user);
    return userCredential;
  };
  
  const register = async (name: string, email: string, address: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // After successful registration, create the Firestore user document
    await createFirestoreUser(user, name, address);
    return userCredential;
  };

  const logout = () => {
    signOut(auth).then(() => {
        setCurrentUser(null);
        setCart([]); // Clear cart in memory
        router.push('/login');
    });
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const newQuantity = (cart.find(item => item.product.id === product.id)?.quantity || 0) + quantity;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { product, quantity }];
    });

    if (firebaseUser) {
      const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, product.id);
      setDoc(cartItemRef, { quantity: newQuantity, productId: product.id }, { merge: true })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: cartItemRef.path, operation: 'write', requestResourceData: { quantity: newQuantity }
          }));
          loadCartFromFirestore(firebaseUser.uid);
        });
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));

     if (firebaseUser) {
        const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, productId);
        deleteDoc(cartItemRef)
          .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: cartItemRef.path, operation: 'delete'
            }));
            loadCartFromFirestore(firebaseUser.uid);
          });
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );

    if (firebaseUser) {
      const cartItemRef = doc(firestore, `users/${firebaseUser.uid}/cart`, productId);
      setDoc(cartItemRef, { quantity }, { merge: true })
        .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: cartItemRef.path, operation: 'update', requestResourceData: { quantity }
            }));
            loadCartFromFirestore(firebaseUser.uid);
        });
    }
  };

  const clearCart = () => {
    setCart([]);
     if (firebaseUser) {
        const cartCollectionRef = collection(firestore, `users/${firebaseUser.uid}/cart`);
        getDocs(cartCollectionRef).then(snapshot => {
            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            batch.commit()
              .catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: cartCollectionRef.path, operation: 'delete'
                }));
                loadCartFromFirestore(firebaseUser.uid);
              });
        })
    }
  };

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'| 'total' | 'items' | 'userId'>) => {
    const commonOrderData: Omit<Order, 'id' | 'userId'> = {
      createdAt: serverTimestamp() as any,
      status: 'Pending',
      items: cart.map(item => ({
        product: {
          id: item.product.id, name: item.product.name, price: item.product.price, image: item.product.image,
        },
        quantity: item.quantity
      })),
      total: cartTotal,
      ...orderData
    };
    
    if (firebaseUser) {
      // Logged-in user flow
      const batch = writeBatch(firestore);
      const publicOrderRef = doc(collection(firestore, 'orders'));
      const userOrderRef = doc(firestore, `users/${firebaseUser.uid}/orders`, publicOrderRef.id);

      const newOrderData: Omit<Order, 'id'> = {
        ...commonOrderData,
        userId: firebaseUser.uid,
      };
      
      batch.set(publicOrderRef, newOrderData);
      batch.set(userOrderRef, newOrderData);
      
      batch.commit().catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `orders/${publicOrderRef.id} (and user order)`,
            operation: 'create',
            requestResourceData: newOrderData
        }));
      });

    } else {
      // Guest user flow
      const publicOrderRef = collection(firestore, 'orders');
      const newOrderData: Omit<Order, 'id'> = {
        ...commonOrderData,
        userId: 'guest', // Identify order as from a guest
      };
      
      addDoc(publicOrderRef, newOrderData).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'orders',
          operation: 'create',
          requestResourceData: newOrderData
        }));
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], customerEmail: string, pickupTime?: string) => {
    const publicOrderRef = doc(firestore, 'orders', orderId);
    
    const orderSnap = await getDoc(publicOrderRef);
    if (!orderSnap.exists()) {
        toast({ variant: "destructive", title: "Error", description: "Order not found." });
        throw new Error("Order not found");
    }
    const orderData = orderSnap.data() as Order;
    const userId = orderData.userId;

    const batch = writeBatch(firestore);
    
    const updateData: any = { status };
    if (pickupTime) {
        updateData.pickupTime = pickupTime;
    }
    
    batch.update(publicOrderRef, updateData);

    // If the order belongs to a registered user, update their private copy too.
    if (userId && userId !== 'guest') {
        const userOrderRef = doc(firestore, `users/${userId}/orders`, orderId);
        batch.update(userOrderRef, updateData);
    }

    try {
      await batch.commit();

      const fullOrderDetails: Order = {
        ...orderData,
        ...updateData,
        id: orderId,
        createdAt: orderData.createdAt, // ensure timestamp is preserved
      };

      if (status === "Accepted") {
          const emailResult = await sendConfirmationEmailAction(fullOrderDetails);
          if (emailResult && emailResult.success) {
               toast({ 
                  title: "Order Accepted!", 
                  description: `Pickup time: ${pickupTime}. Email process initiated.`
              });
          } else {
               toast({ 
                  title: "Order Accepted!", 
                  description: `Pickup time: ${pickupTime}. Email configured in simulation mode.`
              });
          }
      } else if (status === "Rejected") {
          toast({
              variant: "destructive",
              title: "Order Rejected",
              description: `Notification for ${customerEmail} simulated.`,
          });
      }
    } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `orders/${orderId}`,
            operation: 'update',
        }));
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update the order. Check permissions.",
        });
    }
  };
  
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const productsCollection = collection(firestore, 'products');
    addDoc(productsCollection, productData).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'products',
            operation: 'create',
            requestResourceData: productData
        }));
    });
  }
  
  const updateProduct = (productId: string, productData: Partial<Product>) => {
    const productRef = doc(firestore, 'products', productId);
    updateDoc(productRef, productData).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `products/${productId}`,
            operation: 'update',
            requestResourceData: productData
        }));
    });
  }

  const deleteProduct = (productId: string) => {
    const productRef = doc(firestore, 'products', productId);
    deleteDoc(productRef).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `products/${productId}`,
            operation: 'delete'
        }));
    });
  }
  
  const deleteUser = (userId: string) => {
    const userRef = doc(firestore, 'users', userId);
    
    // With email-based admin, we no longer need to manage the roles_admin collection here.
    deleteDoc(userRef).catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `users/${userId}`,
            operation: 'delete'
        }));
    });
  }

  const value: AppContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    addOrder,
    updateOrderStatus,
    isAuthenticated,
    login,
    logout,
    currentUser,
    isUserLoading,
    register,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteUser,
    isAdmin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

    
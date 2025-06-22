import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedFlavor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectedFlavor?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedFlavor?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { currentUser } = useAuth();

  // Calculate total items and price
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Load cart from local storage or Firestore when component mounts
  useEffect(() => {
    const loadCart = async () => {
      if (currentUser) {
        // Load cart from Firestore
        const cartDoc = await getDoc(doc(db, 'carts', currentUser.uid));
        const cartData = cartDoc.data();
        if (cartData?.items) {
          setCart(cartData.items);
        }
      } else {
        // Load cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [currentUser]);

  // Save cart to local storage or Firestore when it changes
  useEffect(() => {
    const saveCart = async () => {
      if (currentUser) {
        // Save cart to Firestore
        await setDoc(doc(db, 'carts', currentUser.uid), {
          items: cart,
          updatedAt: new Date()
        });
      } else {
        // Save cart to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    };

    saveCart();
  }, [cart, currentUser]);

  function addToCart(item: CartItem) {
    setCart(prevCart => {
      // Para productos con sabores, consideramos que son items diferentes si tienen diferente sabor
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.selectedFlavor === item.selectedFlavor
      );
      
      if (existingItemIndex >= 0) {
        // Item existe con el mismo sabor, actualizar cantidad
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Item no existe o tiene diferente sabor, agregarlo
        return [...prevCart, item];
      }
    });
  }

  function removeFromCart(id: string, selectedFlavor?: string) {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === id && item.selectedFlavor === selectedFlavor)
    ));
  }

  function updateQuantity(id: string, quantity: number, selectedFlavor?: string) {
    if (quantity <= 0) {
      removeFromCart(id, selectedFlavor);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id && item.selectedFlavor === selectedFlavor 
          ? { ...item, quantity } 
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
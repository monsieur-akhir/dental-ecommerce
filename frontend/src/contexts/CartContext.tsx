import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface CartContextType {
  items: CartItem[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  isAddingToCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Charger le panier depuis le localStorage ou le serveur
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Si l'utilisateur est connecté, charger depuis le serveur
        try {
          const serverCart = await cartService.getCart();
          setItems(serverCart);
        } catch (error) {
          console.error('Erreur lors du chargement du panier serveur:', error);
          // Fallback vers le localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              setItems(JSON.parse(savedCart));
            } catch (error) {
              console.error('Erreur lors du chargement du panier local:', error);
            }
          }
        }
      } else {
        // Si l'utilisateur n'est pas connecté, charger depuis le localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Erreur lors du chargement du panier:', error);
          }
        }
      }
    };

    loadCart();
  }, [user]);

  // Sauvegarder le panier dans le localStorage et/ou le serveur à chaque modification
  useEffect(() => {
    // Toujours sauvegarder dans le localStorage pour les utilisateurs non connectés
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Si l'utilisateur est connecté, synchroniser avec le serveur
    if (user && items.length > 0) {
      // Note: La synchronisation complète avec le serveur se fait dans les fonctions individuelles
      // pour éviter les boucles infinies
    }
  }, [items, user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    setIsAddingToCart(true);
    try {
      // Mettre à jour l'état local
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.product.id === product.id);
        
        if (existingItem) {
          return currentItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...currentItems, { product, quantity }];
        }
      });

      // Si l'utilisateur est connecté, synchroniser avec le serveur
      if (user) {
        try {
          await cartService.addToCart(product.id, quantity);
        } catch (error) {
          console.error('Erreur lors de la synchronisation avec le serveur:', error);
          // L'état local reste inchangé même si la synchronisation échoue
        }
      }

      // Afficher une notification de succès
      addNotification({
        type: 'success',
        title: 'Produit ajouté au panier',
        message: `${product.name} a été ajouté à votre panier`,
        duration: 3000
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
    
    // Si l'utilisateur est connecté, synchroniser avec le serveur
    if (user) {
      try {
        await cartService.removeFromCart(productId);
      } catch (error) {
        console.error('Erreur lors de la suppression côté serveur:', error);
      }
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );

    // Si l'utilisateur est connecté, synchroniser avec le serveur
    if (user) {
      try {
        await cartService.updateCartItem(productId, quantity);
      } catch (error) {
        console.error('Erreur lors de la mise à jour côté serveur:', error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    
    // Si l'utilisateur est connecté, synchroniser avec le serveur
    if (user) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Erreur lors du vidage côté serveur:', error);
      }
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const isInCart = (productId: number) => {
    return items.some(item => item.product.id === productId);
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    cart: items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity,
    isAddingToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


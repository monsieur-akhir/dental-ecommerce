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
      console.log('🛒 Chargement du panier - Utilisateur connecté:', !!user);
      
      if (user) {
        // Si l'utilisateur se connecte, fusionner le panier local avec le panier serveur
        const savedCart = localStorage.getItem('cart');
        let localCart: CartItem[] = [];
        
        console.log('🛒 Panier sauvegardé dans localStorage:', savedCart);
        
        if (savedCart) {
          try {
            localCart = JSON.parse(savedCart);
            console.log('🛒 Panier local parsé:', localCart);
          } catch (error) {
            console.error('Erreur lors du chargement du panier local:', error);
          }
        }

        // Pour l'instant, garder le panier local car les endpoints serveur ne sont pas encore implémentés
        if (localCart.length > 0) {
          console.log('🛒 Définition du panier avec', localCart.length, 'articles');
          setItems(localCart);
          addNotification({
            type: 'success',
            title: 'Panier conservé',
            message: `Votre panier a été conservé lors de la connexion`,
            duration: 3000
          });
        } else {
          console.log('🛒 Aucun article dans le panier local');
        }
        
        // TODO: Implémenter la synchronisation avec le serveur quand les endpoints seront disponibles
        // try {
        //   const serverCart = await cartService.getCart();
        //   // Logique de fusion...
        // } catch (error) {
        //   console.error('Erreur lors du chargement du panier serveur:', error);
        // }
      } else {
        // Si l'utilisateur n'est pas connecté, charger depuis le localStorage
        const savedCart = localStorage.getItem('cart');
        console.log('🛒 Chargement panier non connecté:', savedCart);
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            console.log('🛒 Panier non connecté parsé:', parsedCart);
            setItems(parsedCart);
          } catch (error) {
            console.error('Erreur lors du chargement du panier:', error);
          }
        }
      }
    };

    loadCart();
  }, [user]);

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    // Toujours sauvegarder dans le localStorage pour la persistance
    localStorage.setItem('cart', JSON.stringify(items));
    
    // TODO: Synchroniser avec le serveur quand les endpoints seront disponibles
    // if (user && items.length > 0) {
    //   // Synchronisation avec le serveur
    // }
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

      // TODO: Synchroniser avec le serveur quand les endpoints seront disponibles
      // if (user) {
      //   try {
      //     await cartService.addToCart(product.id, quantity);
      //   } catch (error) {
      //     console.error('Erreur lors de la synchronisation avec le serveur:', error);
      //   }
      // }

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
    
    // TODO: Synchroniser avec le serveur quand les endpoints seront disponibles
    // if (user) {
    //   try {
    //     await cartService.removeFromCart(productId);
    //   } catch (error) {
    //     console.error('Erreur lors de la suppression côté serveur:', error);
    //   }
    // }
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

    // TODO: Synchroniser avec le serveur quand les endpoints seront disponibles
    // if (user) {
    //   try {
    //     await cartService.updateCartItem(productId, quantity);
    //   } catch (error) {
    //     console.error('Erreur lors de la mise à jour côté serveur:', error);
    //   }
    // }
  };

  const clearCart = async () => {
    setItems([]);
    
    // TODO: Synchroniser avec le serveur quand les endpoints seront disponibles
    // if (user) {
    //   try {
    //     await cartService.clearCart();
    //   } catch (error) {
    //     console.error('Erreur lors du vidage côté serveur:', error);
    //   }
    // }
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


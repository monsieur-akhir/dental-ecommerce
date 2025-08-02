import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Product } from '../types';
import api from '../services/api';

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  getWishlistStats: () => Promise<any>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await api.get('/wishlist');
      setWishlistItems(response.data);
      setWishlistCount(response.data.length);
    } catch (error) {
      console.error('Erreur lors du chargement de la wishlist:', error);
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Charger la wishlist au montage et quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
      setWishlistCount(0);
    }
  }, [isAuthenticated, user, refreshWishlist]);

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour ajouter des produits à vos favoris');
    }

    try {
      setIsLoading(true);
      const response = await api.post('/wishlist', { productId });
      
      // Ajouter le nouvel élément à la liste
      setWishlistItems(prev => [response.data, ...prev]);
      setWishlistCount(prev => prev + 1);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('Ce produit est déjà dans vos favoris');
      }
      throw new Error('Erreur lors de l\'ajout aux favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await api.delete(`/wishlist/${productId}`);
      
      // Retirer l'élément de la liste
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      setWishlistCount(prev => prev - 1);
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw new Error('Erreur lors de la suppression des favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await api.delete('/wishlist');
      
      setWishlistItems([]);
      setWishlistCount(0);
    } catch (error) {
      console.error('Erreur lors de la suppression de la wishlist:', error);
      throw new Error('Erreur lors de la suppression de la wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const getWishlistStats = async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await api.get('/wishlist/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
    getWishlistStats,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};


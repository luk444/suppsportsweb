import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { FavoriteItem, Product } from '../types';

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Cargar favoritos del usuario
  const loadFavorites = async () => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      const favoritesList: FavoriteItem[] = [];

      // Obtener los productos completos para cada favorito
      for (const favoriteDoc of snapshot.docs) {
        const favoriteData = favoriteDoc.data();
        const productDoc = await getDoc(doc(db, 'products', favoriteData.productId));
        
        if (productDoc.exists()) {
          favoritesList.push({
            id: favoriteDoc.id,
            productId: favoriteData.productId,
            userId: favoriteData.userId,
            addedAt: favoriteData.addedAt,
            product: {
              id: productDoc.id,
              ...productDoc.data()
            } as Product
          });
        }
      }

      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error loading favorites:', error);
      addToast('Error al cargar favoritos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Agregar a favoritos
  const addToFavorites = async (product: Product) => {
    if (!currentUser) {
      addToast('Debes iniciar sesión para agregar favoritos', 'warning');
      return;
    }

    if (isFavorite(product.id)) {
      addToast('Este producto ya está en tus favoritos', 'info');
      return;
    }

    try {
      const favoriteData = {
        productId: product.id,
        userId: currentUser.uid,
        addedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
      
      const newFavorite: FavoriteItem = {
        id: docRef.id,
        productId: product.id,
        userId: currentUser.uid,
        addedAt: favoriteData.addedAt,
        product: product
      };

      setFavorites(prev => [...prev, newFavorite]);
      addToast('Producto agregado a favoritos', 'success');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      addToast('Error al agregar a favoritos', 'error');
    }
  };

  // Remover de favoritos
  const removeFromFavorites = async (productId: string) => {
    if (!currentUser) return;

    try {
      const favoriteToRemove = favorites.find(fav => fav.productId === productId);
      
      if (favoriteToRemove) {
        await deleteDoc(doc(db, 'favorites', favoriteToRemove.id));
        setFavorites(prev => prev.filter(fav => fav.productId !== productId));
        addToast('Producto removido de favoritos', 'success');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      addToast('Error al remover de favoritos', 'error');
    }
  };

  // Verificar si un producto está en favoritos
  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.productId === productId);
  };

  // Cargar favoritos cuando el usuario cambie
  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 
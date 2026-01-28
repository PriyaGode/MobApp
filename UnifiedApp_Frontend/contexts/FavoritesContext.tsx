import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../config/apiConfig';
import { AuthContext } from './AuthContext';

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  cardImage: string;
  variety?: string;
  weight?: string;
  rating?: number;
  stock?: number;
}

interface Favorite {
  id: number;
  userId: number;
  productId: number;
  product: FavoriteProduct;
  createdAt: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  favoriteProductIds: Set<number>;
  loading: boolean;
  addFavorite: (productId: number) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  favoriteProductIds: new Set(),
  loading: false,
  addFavorite: async () => {},
  removeFavorite: async () => {},
  isFavorite: () => false,
  refreshFavorites: async () => {},
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await fetch(API.GET_USER_FAVORITES(user.userId));
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
        setFavoriteProductIds(new Set(data.map((f: Favorite) => f.productId)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      refreshFavorites();
    } else {
      setFavorites([]);
      setFavoriteProductIds(new Set());
    }
  }, [user?.userId]);

  const addFavorite = async (productId: number) => {
    if (!user?.userId) {
      console.warn('Cannot add favorite: User not logged in');
      return;
    }

    try {
      const response = await fetch(API.ADD_FAVORITE(user.userId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        await refreshFavorites();
      } else {
        const errorText = await response.text();
        console.error('Failed to add favorite:', response.status, errorText);
        throw new Error('Failed to add favorite');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (productId: number) => {
    if (!user?.userId) {
      console.warn('Cannot remove favorite: User not logged in');
      return;
    }

    try {
      const response = await fetch(API.REMOVE_FAVORITE(user.userId, productId), {
        method: 'DELETE',
      });

      if (response.ok || response.status === 204) {
        await refreshFavorites();
      } else {
        const errorText = await response.text();
        console.error('Failed to remove favorite:', response.status, errorText);
        throw new Error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favoriteProductIds.has(productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteProductIds,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

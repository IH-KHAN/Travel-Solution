import { useState, useEffect } from 'react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────
export interface MenuItemDTO {
  menuId: number;
  menuItem: string | null;
  itemPrice: number;
}

export interface BreakfastDetailDTO extends MenuItemDTO {
  breakfastTime: string;
}

export interface LunchDetailDTO extends MenuItemDTO {
  lunchTime: string;
}

export interface DinnerDetailDTO extends MenuItemDTO {
  dinnerTime: string;
}

export interface RestaurantMasterDTO {
  restaurantId: number;
  restaurantName: string | null;
  location: string | null;
  isOpen: boolean;
  breakfasts: BreakfastDetailDTO[];
  lunches: LunchDetailDTO[];
  dinners: DinnerDetailDTO[];
}

// ── Hook: List ────────────────────────────────────────────────────
interface UseRestaurantsResult {
  restaurants: RestaurantMasterDTO[];
  loading: boolean;
  error: string | null;
}

export const useRestaurants = (): UseRestaurantsResult => {
  const [restaurants, setRestaurants] = useState<RestaurantMasterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<RestaurantMasterDTO[]>('/Restaurants/MasterDetail', {
          signal: controller.signal,
        });
        setRestaurants(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load restaurants. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
    return () => controller.abort();
  }, []);

  return { restaurants, loading, error };
};

// ── Hook: Detail ──────────────────────────────────────────────────
interface UseRestaurantByIdResult {
  restaurant: RestaurantMasterDTO | null;
  loading: boolean;
  error: string | null;
}

export const useRestaurantById = (id: number | null): UseRestaurantByIdResult => {
  const [restaurant, setRestaurant] = useState<RestaurantMasterDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<RestaurantMasterDTO>(`/Restaurants/MasterDetail/${id}`, {
          signal: controller.signal,
        });
        setRestaurant(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Restaurant not found.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [id]);

  return { restaurant, loading, error };
};

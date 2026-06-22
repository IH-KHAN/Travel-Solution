import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface CustomTourDTO {
  customTourRequestId: number;
  userID: number;
  phone: string;
  numOfTravelers: number;
  startDate: string;
  endDate: string;
  description: string;
  totalBudget: number;
  status: string;
}

export interface CustomTourCreateDTO {
  userID: number;
  phone: string;
  numOfTravelers: number;
  startDate: string;
  endDate: string;
  description: string;
  totalBudget: number;
}

export const useCustomTours = () => {
  const [customTours, setCustomTours] = useState<CustomTourDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomTours = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<CustomTourDTO[]>('/CustomTours');
      setCustomTours(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch custom tours.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomTours();
  }, []);

  const createCustomTour = async (payload: CustomTourCreateDTO) => {
    const { data } = await api.post<CustomTourDTO>('/CustomTours', payload);
    return data;
  };

  return { customTours, loading, error, createCustomTour, refetch: fetchCustomTours };
};

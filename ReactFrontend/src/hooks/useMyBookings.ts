import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface TourBookingDTO {
  bookingId: number;
  userId: number;
  packageId: number;
  amount: number;
  status: string | null;
  paymentStatus: string | null;
  createdAt: string;
  travellers: Array<{
    travellerName: string;
    phone: string;
    email: string;
    age: number;
    gender: string;
  }>;
}

export interface HotelBookingRoomDetailDTO {
  hotelBookingRoomID: number;
  bookingId: number;
  roomId: number;
  quantity: number;
  unitPrice: number;
  roomNumber?: string | null;
  floor?: string | null;
  assignedRoomNumbers?: string | null;
  assignedFloors?: string | null;
  roomTypeName?: string | null;
}

export interface HotelBookingDTO {
  hotelBookingID: number;
  clientID: number;
  hotelID: number;
  hotelName?: string | null;
  checkInDate: string;
  checkOutDate: string;
  fareTotal: number;
  bookingStatus: string | null;
  paymentStatus: string | null;
  rooms?: HotelBookingRoomDetailDTO[];
}

interface UseMyBookingsResult {
  tourBookings: TourBookingDTO[];
  hotelBookings: HotelBookingDTO[];
  loading: boolean;
  error: string | null;
}

export const useMyBookings = (): UseMyBookingsResult => {
  const [tourBookings, setTourBookings] = useState<TourBookingDTO[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [toursRes, hotelsRes] = await Promise.all([
          api.get<TourBookingDTO[]>('/Bookings', { signal: controller.signal }),
          api.get<HotelBookingDTO[]>('/HotelBookings', { signal: controller.signal })
        ]);

        setTourBookings(toursRes.data.filter(b => b.userId === userId));
        setHotelBookings(hotelsRes.data.filter(b => b.clientID === userId));
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load bookings.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    return () => controller.abort();
  }, []);

  return { tourBookings, hotelBookings, loading, error };
};

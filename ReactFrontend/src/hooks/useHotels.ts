import { useState, useEffect } from 'react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────
export interface RoomImageDTO {
  room_ImageID: number;
  imageUrl: string | null;
  isPrimaryImage: boolean;
}

export interface RoomBookedDateDTO {
  checkIn: string;
  checkOut: string;
  quantity: number;
  roomView?: string | null;
}

export interface RoomUnitDTO {
  roomUnitId: number;
  roomId: number;
  roomNumber: string | null;
  floor: string | null;
  roomView: string | null;
  isAvailable: boolean;
}

export interface RoomDetailDTO {
  roomId: number;
  description: string | null;
  pricePerNight: number;
  maxGuest: number;
  isAvailable: boolean;
  roomTypeId: number;
  roomTypeName?: string | null;
  totalUnits: number;
  roomUnits: RoomUnitDTO[];
  room_Images: RoomImageDTO[];
  bookedDates: RoomBookedDateDTO[];
}

export interface HotelImageDTO {
  hotelImagesId: number;
  hotelImageUrl: string | null;
  imageCaption: string | null;
}

export interface HotelMasterDTO {
  hotelId: number;
  hotelName: string | null;
  accommodationType: string | null;
  starRating: number;
  userRating: number;
  cityArea: string | null;
  neighborhood: string | null;
  address: string | null;
  description: string | null;
  policy: string | null;
  hotelEmail: string | null;
  coverImage: string | null;
  isActive: boolean;
  createdAt: string;
  isCoupleFriendly: boolean;
  amenities: string | null;
  discountPercent: number;
  extraDiscountText: string | null;
  hasGetPoints: boolean;
  rooms: RoomDetailDTO[];
  hotelImages: HotelImageDTO[];
}

// ── Hook ──────────────────────────────────────────────────────────
interface UseHotelsResult {
  hotels: HotelMasterDTO[];
  loading: boolean;
  error: string | null;
}

export const useHotels = (): UseHotelsResult => {
  const [hotels, setHotels] = useState<HotelMasterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<HotelMasterDTO[]>('/Hotels/MasterDetail', {
          signal: controller.signal,
        });
        setHotels(data.filter(h => h.isActive));
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load hotels. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
    return () => controller.abort();
  }, []);

  return { hotels, loading, error };
};

// ── Single hotel detail ──────────────────────────────────────────
interface UseHotelByIdResult {
  hotel: HotelMasterDTO | null;
  loading: boolean;
  error: string | null;
}

export const useHotelById = (id: number | null): UseHotelByIdResult => {
  const [hotel, setHotel] = useState<HotelMasterDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<HotelMasterDTO>(`/Hotels/MasterDetail/${id}`, {
          signal: controller.signal,
        });
        setHotel(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Hotel not found.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [id]);

  return { hotel, loading, error };
};

// ── Create booking payloads ──────────────────────────────────────
export interface CreateHotelBookingDTO {
  clientID: number;
  hotelID: number;
  checkInDate: string;
  checkOutDate: string;
  fareTotal: number;
  bookingStatus: string;
  paymentStatus: string;
}

export interface CreateHotelBookingRoomDTO {
  bookingId: number;
  roomId: number;
  quantity: number;
  unitPrice: number;
  roomView?: string | null;
}

export const createHotelBooking = async (payload: CreateHotelBookingDTO) => {
  const { data } = await api.post('/HotelBookings', payload);
  return data;
};

export const createHotelBookingRoom = async (payload: CreateHotelBookingRoomDTO) => {
  const { data } = await api.post('/HotelBookingRooms', payload);
  return data;
};

import { useState, useEffect } from 'react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────
export interface PictureDTO {
  pictureId: number;
  picUrl: string | null;
}

export interface ActivityDetailDTO {
  activityId: number;
  activityName: string;
  activityType: string;
  plannedTime: string;
  actualTime: string | null;
  isCompleted: boolean;
  activityDescription: string;
  projectedCost: number;
  details?: Record<string, unknown>;
}

export interface PackageMasterDTO {
  packageId: number;
  packageCode: string | null;
  packageTitle: string | null;
  description: string | null;
  locationId: number;
  createdBy: number;
  durationDays: number;
  durationNight: number;
  markUpAmount: number;
  discount: number;
  packagePrice: number;
  isMarkupPercent: boolean;
  isDiscountPercent: boolean;
  maxTourist: number;
  availableVacancy: number;
  isActive: boolean;
  createAt: string;
  activities: ActivityDetailDTO[];
  pictures: PictureDTO[];
}

// ── Hook ──────────────────────────────────────────────────────────
interface UsePackagesResult {
  packages: PackageMasterDTO[];
  loading: boolean;
  error: string | null;
}

export const usePackages = (filterStarted: boolean = true): UsePackagesResult => {
  const [packages, setPackages] = useState<PackageMasterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<PackageMasterDTO[]>('/Packages/MasterDetail', {
          signal: controller.signal,
        });
        const availablePackages = data.filter(p => {
          if (filterStarted) {
            if (!p.isActive) return false;
            const hasStarted = p.activities?.some(a => a.isCompleted || a.actualTime !== null);
            return !hasStarted;
          }
          return true;
        });
        setPackages(availablePackages);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load tour packages. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
    return () => controller.abort();
  }, [filterStarted]);

  return { packages, loading, error };
};

// ── Single package detail ──────────────────────────────────────────
interface UsePackageByIdResult {
  pkg: PackageMasterDTO | null;
  loading: boolean;
  error: string | null;
}

export const usePackageById = (id: number | null): UsePackageByIdResult => {
  const [pkg, setPkg] = useState<PackageMasterDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<PackageMasterDTO>(`/Packages/MasterDetail/${id}`, {
          signal: controller.signal,
        });
        const hasStarted = data.activities?.some(a => a.isCompleted || a.actualTime !== null);
        if (!data.isActive || hasStarted) {
          setError('Package is no longer available for booking.');
          setPkg(null);
        } else {
          setPkg(data);
        }
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Package not found.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, [id]);

  return { pkg, loading, error };
};

// ── Create booking payload ─────────────────────────────────────────
export interface CreateBookingDTO {
  userId: number;
  packageId: number;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  travellers: Array<{
    travellerName: string;
    phone: string;
    email: string;
    age: number;
    gender: string;
  }>;
}

export const createBooking = async (payload: CreateBookingDTO) => {
  const { data } = await api.post('/Bookings', payload);
  return data;
};


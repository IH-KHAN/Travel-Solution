import { useState, useEffect } from 'react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────
export interface TourSpotDTO {
  spotId: number;
  spotName: string | null;
  locationId: number;
}

export interface LocationDTO {
  locationId: number;
  locationName: string | null;
  divisionId: number;
  divisionName?: string | null;
  tourSpots?: TourSpotDTO[];
}

export interface DivisionDTO {
  divisionId: number;
  divisionName: string | null;
  locations?: LocationDTO[];
}

// ── Hook: useLocations ────────────────────────────────────────────
interface UseLocationsResult {
  locations: LocationDTO[];
  loading: boolean;
  error: string | null;
}

export const useLocations = (): UseLocationsResult => {
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<LocationDTO[]>('/Locations', {
          signal: controller.signal,
        });
        setLocations(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load destinations.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
    return () => controller.abort();
  }, []);

  return { locations, loading, error };
};

// ── Hook: useDivisions ────────────────────────────────────────────
interface UseDivisionsResult {
  divisions: DivisionDTO[];
  loading: boolean;
  error: string | null;
}

export const useDivisions = (): UseDivisionsResult => {
  const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<DivisionDTO[]>('/Divisions', {
          signal: controller.signal,
        });
        setDivisions(data);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to load divisions.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => controller.abort();
  }, []);

  return { divisions, loading, error };
};

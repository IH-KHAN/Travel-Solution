import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useHotels } from '@/hooks/useHotels';
import api from '@/lib/api';
import HotelCard from '@/components/client/cards/HotelCard';
import SectionHeader from '@/components/client/ui/SectionHeader';
import { SkeletonCards } from '@/components/client/ui/SkeletonCard';

const LIMIT = 6;

const FeaturedHotels: React.FC = () => {
  const { hotels, loading, error } = useHotels();
  const featured = hotels.slice(0, LIMIT);

  const [reviewsMap, setReviewsMap] = useState<Record<number, number>>({});
  
  useEffect(() => {
    api.get('/Reviews').then(res => {
      const map: Record<number, number> = {};
      res.data.forEach((r: any) => {
        if (r.hotelId) {
          map[r.hotelId] = (map[r.hotelId] || 0) + 1;
        }
      });
      setReviewsMap(map);
    }).catch(err => console.error('Failed to fetch reviews count', err));
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Hotels"
          subtitle="Curated stays for every kind of traveller"
          viewAllLink="/hotels"
          viewAllLabel="View All Hotels"
        />

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Cards row */}
        <div className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <SkeletonCards count={4} />
          ) : featured.length > 0 ? (
            featured.map(hotel => <HotelCard key={hotel.hotelId} hotel={hotel} reviewCount={reviewsMap[hotel.hotelId] || 0} />)
          ) : (
            !error && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">🏨</div>
                <p className="font-semibold text-lg" style={{ color: 'var(--brand-navy)' }}>No hotels listed yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back soon for amazing stays!</p>
              </div>
            )
          )}
        </div>

        {/* View all CTA */}
        {!loading && featured.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to="/hotels"
              className="btn-brand px-8 py-3.5 text-base rounded-xl inline-flex items-center gap-2"
            >
              Explore All Hotels
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotels;

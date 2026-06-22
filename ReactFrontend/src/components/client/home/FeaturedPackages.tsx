import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { usePackages } from '@/hooks/usePackages';
import TourPackageCard from '@/components/client/cards/TourPackageCard';
import SectionHeader from '@/components/client/ui/SectionHeader';
import { SkeletonCards } from '@/components/client/ui/SkeletonCard';

const LIMIT = 6;

const FeaturedPackages: React.FC = () => {
  const { packages, loading, error } = usePackages();
  const featured = packages.slice(0, LIMIT);

  return (
    <section className="py-16 lg:py-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Tour Packages"
          subtitle="Handpicked adventures for unforgettable journeys"
          viewAllLink="/tours"
          viewAllLabel="View All Tours"
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
            featured.map(pkg => <TourPackageCard key={pkg.packageId} pkg={pkg} />)
          ) : (
            !error && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-4">🌍</div>
                <p className="font-semibold text-lg" style={{ color: 'var(--brand-navy)' }}>No packages available yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back soon for exciting new tours!</p>
              </div>
            )
          )}
        </div>

        {/* View all CTA */}
        {!loading && featured.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to="/tours"
              className="btn-brand px-8 py-3.5 text-base rounded-xl inline-flex items-center gap-2"
            >
              Explore All Tour Packages
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPackages;

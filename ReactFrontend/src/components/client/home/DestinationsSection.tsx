import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useLocations, type LocationDTO } from '@/hooks/useLocations';
import SectionHeader from '@/components/client/ui/SectionHeader';
import { SkeletonDestinationCard } from '@/components/client/ui/SkeletonCard';

/* Gradient palettes for destination cards when no image is available */
const GRADIENTS = [
  'linear-gradient(135deg, #000269 0%, #1a1aff 100%)',
  'linear-gradient(135deg, #0f4c81 0%, #1a8cff 100%)',
  'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
  'linear-gradient(135deg, #312e81 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)',
];

/* Emojis/icons for known Bangladesh destinations */
const DESTINATION_ICONS: Record<string, string> = {
  "Cox's Bazar": '🏖️',
  'Sylhet':      '🍃',
  'Bandarban':   '⛰️',
  'Sundarbans':  '🌿',
  'Rangamati':   '⛵',
  'Dhaka':       '🏙️',
  'Chittagong':  '⚓',
  'Khulna':      '🌊',
  'Rajshahi':    '🍇',
  'Mymensingh':  '🌸',
};

interface DestinationCardProps {
  location: LocationDTO;
  index: number;
  large?: boolean;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ location, index, large = false }) => {
  const gradient   = GRADIENTS[index % GRADIENTS.length];
  const icon       = Object.entries(DESTINATION_ICONS).find(([k]) =>
    location.locationName?.toLowerCase().includes(k.toLowerCase())
  )?.[1] ?? '📍';

  return (
    <Link
      to={`/tours?location=${location.locationId}`}
      className={`relative rounded-2xl overflow-hidden block group cursor-pointer ${large ? 'row-span-2' : ''}`}
      style={{ minHeight: large ? '26rem' : '12rem' }}
    >
      {/* Background */}
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{ background: gradient }} />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")' }} />

      {/* Dark bottom gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

      {/* Arrow hover indicator */}
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <ArrowRight size={16} className="text-white" />
      </div>

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={13} className="text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold tracking-wide">
            {location.divisionName ?? 'Bangladesh'}
          </span>
        </div>
        <h3 className={`text-white font-bold leading-tight ${large ? 'text-2xl' : 'text-lg'}`}>
          {icon} {location.locationName}
        </h3>
        <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
          Explore destination <ArrowRight size={11} />
        </p>
      </div>
    </Link>
  );
};

const DestinationsSection: React.FC = () => {
  const { locations, loading } = useLocations();
  const featured = locations.slice(0, 6);

  return (
    <section className="py-16 lg:py-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Explore by Destination"
          subtitle="Popular destinations waiting to be discovered"
          viewAllLink="/destinations"
          viewAllLabel="All Destinations"
        />

        {/* Masonry-style grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonDestinationCard key={i} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[12rem]">
            {featured.map((loc, i) => (
              <DestinationCard
                key={loc.locationId}
                location={loc}
                index={i}
                large={i === 0}   /* first card spans 2 rows */
              />
            ))}
          </div>
        ) : (
          /* Fallback static destinations if API returns nothing */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[12rem]">
            {[
              { locationId: 0, locationName: "Cox's Bazar", divisionId: 0, divisionName: 'Chittagong' },
              { locationId: 0, locationName: 'Sylhet',       divisionId: 0, divisionName: 'Sylhet' },
              { locationId: 0, locationName: 'Bandarban',    divisionId: 0, divisionName: 'Chittagong' },
              { locationId: 0, locationName: 'Sundarbans',   divisionId: 0, divisionName: 'Khulna' },
              { locationId: 0, locationName: 'Rangamati',    divisionId: 0, divisionName: 'Chittagong' },
              { locationId: 0, locationName: 'Dhaka',        divisionId: 0, divisionName: 'Dhaka' },
            ].map((loc, i) => (
              <DestinationCard key={i} location={loc} index={i} large={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationsSection;

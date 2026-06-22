import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, ArrowRight, ImageOff } from 'lucide-react';
import type { PackageMasterDTO } from '@/hooks/usePackages';

interface TourPackageCardProps {
  pkg: PackageMasterDTO;
}

const TourPackageCard: React.FC<TourPackageCardProps> = ({ pkg }) => {
  const coverImage = pkg.pictures?.[0]?.picUrl ?? null;
  const baseUrl = 'http://localhost:5246';

  const imageSrc = coverImage
    ? coverImage.startsWith('http')
      ? coverImage
      : `${baseUrl}${coverImage}`
    : null;

  const discountedPrice =
    pkg.packagePrice > 0
      ? pkg.packagePrice - pkg.discount + pkg.markUpAmount
      : 0;

  return (
    <Link to={`/tours/${pkg.packageId}`} className="card-hover flex-shrink-0 w-72 block group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={pkg.packageTitle ?? 'Tour package'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #000269 0%, #0006cc 100%)' }}>
            <ImageOff size={32} className="text-white/40" />
            <span className="text-white/50 text-xs">No image</span>
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-navy text-xs px-2.5 py-1">
            <Clock size={11} className="mr-1" />
            {pkg.durationDays}D / {pkg.durationNight}N
          </span>
        </div>
        {/* Discount badge */}
        {pkg.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="badge-yellow text-xs px-2.5 py-1 font-bold">
              {pkg.isDiscountPercent
                ? `${Math.round((pkg.discount / (pkg.packagePrice || 1)) * 100)}% OFF`
                : `BDT ${pkg.discount.toLocaleString()} OFF`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <MapPin size={12} style={{ color: 'var(--brand-yellow)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Location #{pkg.locationId}
          </span>
        </div>

        <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
          style={{ color: 'var(--brand-navy)' }}>
          {pkg.packageTitle ?? 'Untitled Package'}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Users size={12} /> Max {pkg.maxTourist}
          </span>
          {pkg.packageCode && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              #{pkg.packageCode}
            </span>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>From</p>
            <p className="font-bold text-lg" style={{ color: 'var(--brand-navy)' }}>
              ৳ {discountedPrice > 0 ? discountedPrice.toLocaleString() : pkg.packagePrice.toLocaleString()}
            </p>
          </div>
          <button
            className="btn-brand px-4 py-2 text-sm rounded-xl flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default TourPackageCard;

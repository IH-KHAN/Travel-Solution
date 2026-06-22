import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, ArrowRight, ImageOff } from 'lucide-react';
import { type PackageMasterDTO } from '@/hooks/usePackages';

const BASE_URL = 'http://localhost:5246';

const ACTIVITY_COLORS: Record<string, string> = {
  TransportActivity:    'bg-blue-100 text-blue-700',
  HotelActivity:        'bg-purple-100 text-purple-700',
  MealActivity:         'bg-orange-100 text-orange-700',
  SpotVisitActivity:    'bg-green-100 text-green-700',
  MidwayBreakActivity:  'bg-yellow-100 text-yellow-700',
  OtherActivity:        'bg-slate-100 text-slate-600',
};

export const TourCard: React.FC<{ pkg: PackageMasterDTO }> = ({ pkg }) => {
  const coverImg = pkg.pictures?.[0]?.picUrl;
  const imgSrc   = coverImg
    ? coverImg.startsWith('http') ? coverImg : `${BASE_URL}${coverImg}`
    : null;

  const finalPrice = pkg.packagePrice - pkg.discount + pkg.markUpAmount;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100 flex-shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={pkg.packageTitle ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
            <ImageOff size={32} className="text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--brand-navy)', color: '#fff' }}>
            <Clock size={10} className="inline mr-1" />
            {pkg.durationDays}D / {pkg.durationNight}N
          </span>
          {pkg.discount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
              {pkg.isDiscountPercent
                ? `${Math.round((pkg.discount / (pkg.packagePrice || 1)) * 100)}% OFF`
                : `৳${Math.round(pkg.discount).toLocaleString()} OFF`}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={12} className="text-yellow-500" />
          <span className="text-xs text-slate-400 font-medium">Location #{pkg.locationId}</span>
        </div>

        <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2"
          style={{ color: 'var(--brand-navy)' }}>
          {pkg.packageTitle ?? 'Untitled Package'}
        </h3>

        {pkg.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{pkg.description}</p>
        )}

        {/* Activity type pills */}
        {pkg.activities && pkg.activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[...new Set(pkg.activities.map(a => a.activityType))].slice(0, 3).map(type => (
              <span key={type} className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTIVITY_COLORS[type] ?? 'bg-slate-100 text-slate-600'}`}>
                {type.replace('Activity', '')}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Users size={12} /> 
            <span className={pkg.availableVacancy === 0 ? 'text-red-500 font-bold' : ''}>
              Vacancy {pkg.availableVacancy}/{pkg.maxTourist}
            </span>
          </span>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">From</p>
            <p className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
              ৳{Math.round(finalPrice > 0 ? finalPrice : pkg.packagePrice).toLocaleString()}
            </p>
          </div>
          <Link to={`/tours/${pkg.packageId}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
            Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

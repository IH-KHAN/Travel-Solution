import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ImageOff, BedDouble, Star, Award, Snowflake, ShieldCheck } from 'lucide-react';
import type { HotelMasterDTO } from '@/hooks/useHotels';

interface HotelCardProps {
  hotel: HotelMasterDTO;
  reviewCount: number;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, reviewCount }) => {
  const baseUrl = 'http://localhost:5246';
  const coverImg = hotel.coverImage
    ? hotel.coverImage.startsWith('http')
      ? hotel.coverImage
      : `${baseUrl}${hotel.coverImage}`
    : hotel.hotelImages?.[0]?.hotelImageUrl
      ? hotel.hotelImages[0].hotelImageUrl.startsWith('http')
        ? hotel.hotelImages[0].hotelImageUrl
        : `${baseUrl}${hotel.hotelImages[0].hotelImageUrl}`
      : null;

  const lowestPrice = hotel.rooms.length > 0
    ? Math.min(...hotel.rooms.map(r => r.pricePerNight))
    : null;

  const availableRooms = hotel.rooms.filter(r => r.isAvailable).length;

  const ratingText = hotel.userRating >= 4.5 ? 'Excellent' : hotel.userRating >= 4.0 ? 'Very Good' : hotel.userRating >= 3.0 ? 'Good' : 'Recommended';
  const isTopSelling = hotel.starRating === 5 || hotel.userRating >= 4.5;
  const hasPromo = hotel.discountPercent > 0 && lowestPrice !== null && lowestPrice > 0;
  const originalPrice = hasPromo && lowestPrice ? Math.round(lowestPrice / (1 - hotel.discountPercent / 100)) : lowestPrice;

  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <Link to={`/hotels/${hotel.hotelId}`} className="card-hover flex-shrink-0 w-72 block group bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Container with Badges */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {coverImg ? (
          <img
            src={coverImg}
            alt={hotel.hotelName ?? 'Hotel'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #000269 0%, #001a99 100%)' }}>
            <ImageOff size={32} className="text-white/40" />
            <span className="text-white/50 text-xs">No image</span>
          </div>
        )}

        {/* Top Selling Badge */}
        {isTopSelling && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-[#000269] text-white shadow-md">
              <Award size={10} className="text-yellow-400 fill-yellow-400" />
              Top Selling
            </span>
          </div>
        )}

        {/* Available Rooms overlay */}
        {availableRooms > 0 && (
          <div className="absolute top-3 right-3">
            <span className="badge-navy text-[10px] font-bold px-2 py-1 flex items-center bg-black/60 text-white backdrop-blur-sm rounded-lg">
              <BedDouble size={10} className="mr-1" />
              {availableRooms} rooms
            </span>
          </div>
        )}

        {/* Get Points Badge */}
        {hotel.hasGetPoints && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
              <span className="w-3 h-3 rounded-full bg-yellow-400 text-black flex items-center justify-center font-extrabold text-[7px]">P</span>
              Get Points
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between h-[280px]">
        <div>
          {/* Rating score, stars, reviewCount */}
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700">
              <Star size={11} className="fill-yellow-400 text-yellow-500" />
              {hotel.starRating.toFixed(1)}
            </span>
            <div className="text-right">
              <span className="font-bold text-[#000269]">{ratingText}</span>
              <span className="text-slate-400 text-[10px] ml-1">({reviewCount} reviews)</span>
            </div>
          </div>

          {/* Hotel Name */}
          <h3 className="font-bold text-base leading-snug mb-1 line-clamp-1 group-hover:text-[#000269] transition-colors"
            style={{ color: 'var(--brand-navy)' }}>
            {hotel.hotelName ?? 'Unnamed Hotel'}
          </h3>

          {/* Location / Pin */}
          <div className="flex items-center gap-1 mb-2.5">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 truncate">
              {hotel.neighborhood || hotel.cityArea || 'Bangladesh'}
            </span>
          </div>

          {/* Couple Friendly Badge */}
          {hotel.isCoupleFriendly && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600">
                <ShieldCheck size={11} className="text-pink-500" />
                Couple Friendly
              </span>
            </div>
          )}

          {/* Amenities Inline */}
          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-50">
              {amenitiesList.slice(0, 3).map((amenity, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded">
                  {amenity.toLowerCase().includes('air conditioning') || amenity.toLowerCase() === 'ac' ? (
                    <Snowflake size={10} className="text-sky-500 shrink-0" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  )}
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Action Section */}
        <div className="border-t border-slate-100 pt-3 mt-auto">
          {lowestPrice !== null && lowestPrice > 0 ? (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-slate-400 leading-none">Starts from</p>
                {hasPromo && originalPrice && (
                  <p className="text-xs text-red-500 line-through font-semibold mt-0.5 leading-none">
                    BDT {originalPrice.toLocaleString()}
                  </p>
                )}
                <p className="font-extrabold text-base mt-1 text-[#000269] leading-none">
                  BDT {lowestPrice.toLocaleString()}
                </p>
                <p className="text-[9px] text-slate-400 mt-1 leading-none">for 1 Night</p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                {hotel.discountPercent > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-sm">
                    {hotel.discountPercent}% off
                  </span>
                )}
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 transition-all shadow-md shadow-yellow-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  Select <ArrowRight size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs italic text-slate-400">Price on request</span>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 transition-all shadow-md shadow-yellow-100"
                onClick={(e) => e.stopPropagation()}
              >
                Select <ArrowRight size={11} />
              </button>
            </div>
          )}

          {/* Bank / Payment dynamic discount text at the bottom */}
          {hotel.extraDiscountText && lowestPrice !== null && lowestPrice > 0 && (
            <p className="text-[9px] text-emerald-600 font-bold mt-2 text-left leading-tight truncate">
              {hotel.extraDiscountText}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;

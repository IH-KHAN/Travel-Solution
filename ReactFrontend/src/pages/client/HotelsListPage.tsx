import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, MapPin, Star, Hotel, ArrowRight,
  X, ChevronDown, ChevronUp, ImageOff, AlertCircle, Calendar, Users, Check,
  Heart, Award, Snowflake, ShieldCheck
} from 'lucide-react';
import { useHotels, type HotelMasterDTO } from '@/hooks/useHotels';
import { SkeletonCards } from '@/components/client/ui/SkeletonCard';
import StarRating from '@/components/client/ui/StarRating';
import api from '@/lib/api';

const BASE_URL = 'http://localhost:5246';

// ── Rating buckets ────────────────────────────────────────────────
const RATING_BUCKETS = [
  { label: 'Any', min: 0 },
  { label: '5 Stars', min: 5 },
  { label: '4+ Stars', min: 4 },
  { label: '3+ Stars', min: 3 },
];

// ── Accommodation Types ───────────────────────────────────────────
const ACCOMMODATION_TYPES = ['Any', 'Resort', 'Hotel', 'Motel', 'Guesthouse', 'Villa'];

// ── Individual Hotel Card ─────────────────────────────────────────
const HotelListCard: React.FC<{ 
  hotel: HotelMasterDTO; 
  reviewCount: number; 
  averageRating: number;
}> = ({ hotel, reviewCount, averageRating }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const galleryImages = (hotel.hotelImages || [])
    .map(p => p.hotelImageUrl ? (p.hotelImageUrl.startsWith('http') ? p.hotelImageUrl : `${BASE_URL}${p.hotelImageUrl}`) : null)
    .filter(Boolean) as string[];

  const imgSrc = hotel.coverImage
    ? hotel.coverImage.startsWith('http') ? hotel.coverImage : `${BASE_URL}${hotel.coverImage}`
    : galleryImages[0] || null;

  // Find lowest room price
  const lowestPrice = hotel.rooms.length > 0
    ? Math.min(...hotel.rooms.map(r => r.pricePerNight))
    : 0;

  // Use dynamic client rating if available, otherwise fall back to database value or 4.5
  const displayRating = averageRating > 0 ? averageRating : (hotel.userRating > 0 ? hotel.userRating : 4.5);

  // 1. Dynamic review title text matching quality from database rating
  const ratingText = displayRating >= 4.5 ? 'Excellent' : displayRating >= 4.0 ? 'Very Good' : displayRating >= 3.0 ? 'Good' : 'Recommended';
  
  // 2. Decide if this hotel qualifies for a promotion based on database attributes
  const hasPromo = hotel.discountPercent > 0 && lowestPrice > 0;
  const discountPercent = hotel.discountPercent;
  const originalPrice = hasPromo ? Math.round(lowestPrice / (1 - discountPercent / 100)) : lowestPrice;

  // 3. Show "Top Selling" ONLY if rating is top tier (e.g. 5 stars or highly rated by users)
  const isTopSelling = hotel.starRating === 5 || displayRating >= 4.5;

  // 4. Show "Couple Friendly" dynamically based on database value
  const isCoupleFriendly = hotel.isCoupleFriendly;

  // 5. Dynamic Amenities parsed directly from database values
  const amenitiesList = hotel.amenities
    ? hotel.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-64">
      {/* Left: Image with GoZayaan overlay elements */}
      <div className="relative h-56 md:h-full md:w-80 shrink-0 bg-slate-100 overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={hotel.hotelName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
            <ImageOff size={32} className="text-white/30" />
          </div>
        )}
        
        {/* Top Selling Badge (only if qualified) */}
        {isTopSelling && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#000269] text-white shadow-md">
              <Award size={12} className="text-yellow-400 fill-yellow-400" />
              Top Selling
            </span>
          </div>
        )}

        {/* Favorite heart button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-[#000269]"} />
        </button>

        {/* Get Points Badge */}
        {hotel.hasGetPoints && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 text-black flex items-center justify-center font-extrabold text-[8px]">P</span>
              Get Points
            </span>
          </div>
        )}
      </div>

      {/* Middle & Right Content */}
      <div className="p-6 flex flex-col md:flex-row flex-1 justify-between gap-6 min-w-0">
        
        {/* Middle Section: Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-bold text-xl md:text-2xl text-slate-800 leading-snug line-clamp-1 hover:text-[#000269] transition-colors">
              {hotel.hotelName ?? 'Untitled Hotel'}
            </h3>
            
            {/* Rating pill and Location */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                <Star size={12} className="fill-yellow-400 text-yellow-500" />
                {hotel.starRating.toFixed(1)} Star
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span className="line-clamp-1">{hotel.neighborhood || hotel.cityArea || 'Bangladesh'}</span>
              </span>
            </div>
          </div>

          {/* Couple Friendly Pill (only if qualified) */}
          {isCoupleFriendly && (
            <div className="flex">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600">
                <ShieldCheck size={14} className="text-pink-500" />
                Couple Friendly
              </span>
            </div>
          )}

          {/* Key Amenities (Dynamic from database values) */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-2">
            {amenitiesList.map((amenity, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {amenity === 'Air Conditioning' ? (
                  <Snowflake size={12} className="text-slate-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                )}
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Right Section: Rating score badge, Discount and pricing details */}
        <div className="w-full md:w-56 shrink-0 md:border-l border-slate-100 md:pl-6 flex flex-col justify-between text-right space-y-4 md:space-y-0">
          
          {/* Top: Score Badge */}
          <div className="flex items-center justify-end gap-2.5">
            <div>
              <p className="font-bold text-sm text-[#000269] leading-tight">{ratingText}</p>
              <p className="text-[11px] text-slate-400">{reviewCount} Reviews</p>
            </div>
            <div className="bg-[#000269] text-white rounded-xl p-2 text-center min-w-[50px] shadow-sm">
              <p className="font-extrabold text-base leading-none">{displayRating.toFixed(1)}</p>
              <p className="text-[8px] text-white/70 mt-0.5 leading-none">out of 5</p>
            </div>
          </div>

          {/* Bottom: Pricing & Select CTA */}
          <div className="space-y-2">
            <div className="flex flex-col items-end gap-1">
              {discountPercent > 0 && lowestPrice > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-sm shadow-orange-100 animate-pulse">
                  {discountPercent}% off
                </span>
              )}
              {hotel.extraDiscountText && lowestPrice > 0 && (
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                  {hotel.extraDiscountText}
                </p>
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] text-slate-400">Starts from</p>
              {lowestPrice > 0 ? (
                <>
                  {hasPromo && (
                    <p className="text-xs text-red-500 line-through font-medium">
                      BDT {originalPrice.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xl font-extrabold text-[#000269]">
                    BDT {lowestPrice.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-base font-bold text-slate-500 italic">Price on request</p>
              )}
              <p className="text-[9px] text-slate-400">for 1 Night, per room</p>
            </div>

            <Link 
              to={`/hotels/${hotel.hotelId}`}
              className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-md shadow-yellow-100"
            >
              Select
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

// ── Filter sidebar ────────────────────────────────────────────────
interface FilterPanelProps {
  search: string; setSearch: (v: string) => void;
  ratingIdx: number; setRatingIdx: (i: number) => void;
  typeIdx: number; setTypeIdx: (i: number) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  search, setSearch, ratingIdx, setRatingIdx, typeIdx, setTypeIdx, onReset
}) => {
  const [ratingOpen, setRatingOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: 'var(--brand-navy)' }}>
            <SlidersHorizontal size={16} className="inline mr-2" />Filters
          </h3>
          <button onClick={onReset}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> Reset
          </button>
        </div>

        {/* Keyword/Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Hotel or city..."
              className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              style={{ color: 'var(--brand-navy)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <button
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wide text-slate-400 mb-2"
            onClick={() => setRatingOpen(p => !p)}>
            Star Rating {ratingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {ratingOpen && (
            <div className="space-y-1.5">
              {RATING_BUCKETS.map((b, i) => (
                <button key={i} onClick={() => setRatingIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${ratingIdx === i ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  style={ratingIdx === i ? { backgroundColor: 'var(--brand-navy)' } : {}}>
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accommodation Type */}
        <div>
          <button
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wide text-slate-400 mb-2"
            onClick={() => setTypeOpen(p => !p)}>
            Property Type {typeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {typeOpen && (
            <div className="space-y-1.5">
              {ACCOMMODATION_TYPES.map((type, i) => (
                <button key={i} onClick={() => setTypeIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${typeIdx === i ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  style={typeIdx === i ? { backgroundColor: 'var(--brand-navy)' } : {}}>
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
// Helper function to check if a hotel has rooms available for the requested check-in/check-out dates
const isHotelAvailable = (hotel: HotelMasterDTO, checkInStr: string, checkOutStr: string): boolean => {
  if (!hotel.rooms || hotel.rooms.length === 0) return true;
  if (!checkInStr || !checkOutStr) return true;

  const inDate = new Date(checkInStr).getTime();
  const outDate = new Date(checkOutStr).getTime();
  if (isNaN(inDate) || isNaN(outDate)) return true;

  // A hotel is available if it has at least one room option with available units > 0
  return hotel.rooms.some(room => {
    if (!room.isAvailable) return false;

    const views = new Set<string>();
    if (room.roomUnits && room.roomUnits.length > 0) {
      room.roomUnits.forEach(u => views.add(u.roomView || 'Standard'));
    } else {
      views.add('Standard');
    }

    return Array.from(views).some(view => {
      let totalViewUnits = 0;
      if (room.roomUnits && room.roomUnits.length > 0) {
        totalViewUnits = room.roomUnits.filter(u => (u.roomView || 'Standard') === view).length;
      } else {
        totalViewUnits = room.totalUnits || 1;
      }

      if (room.bookedDates && room.bookedDates.length > 0) {
        let bookedCount = 0;
        for (const b of room.bookedDates) {
          const bookedView = b.roomView || 'Standard';
          if (bookedView === view) {
            const bIn = new Date(b.checkIn).getTime();
            const bOut = new Date(b.checkOut).getTime();
            if (inDate < bOut && outDate > bIn) {
              bookedCount += b.quantity || 1;
            }
          }
        }
        return (totalViewUnits - bookedCount) > 0;
      }

      return totalViewUnits > 0;
    });
  });
};

const HotelsListPage: React.FC = () => {
  const { hotels, loading, error } = useHotels();
  const [searchParams, setSearchParams]  = useSearchParams();

  // Today and Tomorrow dynamic defaults
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => new Date(Date.now() + 86400000).toISOString().split('T')[0], []);

  // Get initial search query parameters or defaults (GoZayaan format or fallback to HeroSection format)
  const initialSearch = searchParams.get('search') || searchParams.get('q') || searchParams.get('city') || '';
  const initialCheckin = searchParams.get('checkin') || searchParams.get('checkIn') || todayStr;
  const initialCheckout = searchParams.get('checkout') || searchParams.get('checkOut') || tomorrowStr;

  // Parse rooms = "1,2,0" -> roomsCount = 1, adultsCount = 2, childrenCount = 0
  const roomsParam = searchParams.get('rooms') || '';
  let rVal = 1, aVal = 2, cVal = 0;
  if (roomsParam) {
    const parts = roomsParam.split(',').map(Number);
    rVal = parts[0] || 1;
    aVal = parts[1] || 2;
    cVal = parts[2] || 0;
  } else if (searchParams.get('guests')) {
    aVal = Number(searchParams.get('guests')) || 2;
  }

  // States
  const [search, setSearch] = useState(initialSearch);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [roomsCount, setRoomsCount] = useState(rVal || 1);
  const [adultsCount, setAdultsCount] = useState(aVal || 2);
  const [childrenCount, setChildrenCount] = useState(cVal || 0);

  const [ratingIdx, setRatingIdx] = useState(0);
  const [typeIdx, setTypeIdx]     = useState(0);
  const [mobileFilter, setMobileFilter] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef<HTMLDivElement>(null);

  const [reviewsData, setReviewsData] = useState<Record<number, { count: number; average: number }>>({});
  
  useEffect(() => {
    api.get('/Reviews').then(res => {
      const map: Record<number, { count: number; sum: number }> = {};
      res.data.forEach((r: any) => {
        if (r.hotelId) {
          if (!map[r.hotelId]) {
            map[r.hotelId] = { count: 0, sum: 0 };
          }
          map[r.hotelId].count += 1;
          map[r.hotelId].sum += r.rating;
        }
      });
      
      const finalMap: Record<number, { count: number; average: number }> = {};
      Object.keys(map).forEach(key => {
        const id = Number(key);
        finalMap[id] = {
          count: map[id].count,
          average: map[id].sum / map[id].count
        };
      });
      setReviewsData(finalMap);
    }).catch(err => console.error('Failed to fetch reviews count', err));
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    const qSearch = searchParams.get('search') || searchParams.get('q') || searchParams.get('city') || '';
    const qCheckin = searchParams.get('checkin') || searchParams.get('checkIn') || todayStr;
    const qCheckout = searchParams.get('checkout') || searchParams.get('checkOut') || tomorrowStr;
    const qRooms = searchParams.get('rooms') || '';
    
    let r = 1, a = 2, c = 0;
    if (qRooms) {
      const parts = qRooms.split(',').map(Number);
      r = parts[0] || 1;
      a = parts[1] || 2;
      c = parts[2] || 0;
    } else if (searchParams.get('guests')) {
      a = Number(searchParams.get('guests')) || 2;
    }

    setSearch(qSearch);
    setCheckin(qCheckin);
    setCheckout(qCheckout);
    setRoomsCount(r);
    setAdultsCount(a);
    setChildrenCount(c);
  }, [searchParams, todayStr, tomorrowStr]);

  // Click outside rooms & guests dropdown handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query parameters
  const triggerSearch = (updatedParams: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...current,
      ...updatedParams
    });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerSearch({
      checkin,
      checkout,
      search,
      rooms: `${roomsCount},${adultsCount},${childrenCount}`
    });
  };

  const handleSortChange = (newSort: string) => {
    triggerSearch({ sort: newSort });
  };

  const filtered = useMemo(() => {
    const ratingBucket = RATING_BUCKETS[ratingIdx];
    const accType      = ACCOMMODATION_TYPES[typeIdx];
    const qSearch = searchParams.get('search') || searchParams.get('q') || searchParams.get('city') || '';
    const qCheckin = searchParams.get('checkin') || searchParams.get('checkIn') || '';
    const qCheckout = searchParams.get('checkout') || searchParams.get('checkOut') || '';
    const qSort = searchParams.get('sort') || 'POPULARITY';

    let list = hotels.filter(h => {
      const matchSearch = !qSearch ||
        h.hotelName?.toLowerCase().includes(qSearch.toLowerCase()) ||
        h.cityArea?.toLowerCase().includes(qSearch.toLowerCase()) ||
        h.neighborhood?.toLowerCase().includes(qSearch.toLowerCase());
      
      const matchRating = h.starRating >= ratingBucket.min;
      const matchType   = accType === 'Any' || h.accommodationType === accType;

      // Filter by room availability only if check-in and check-out dates are explicitly searched
      const matchAvailability = (!qCheckin || !qCheckout) || isHotelAvailable(h, qCheckin, qCheckout);

      return matchSearch && matchRating && matchType && matchAvailability;
    });

    if (qSort === 'POPULARITY') {
      list = [...list].sort((a, b) => {
        const ratingA = reviewsData[a.hotelId]?.average || a.userRating || 4.5;
        const ratingB = reviewsData[b.hotelId]?.average || b.userRating || 4.5;
        return ratingB - ratingA;
      });
    } else if (qSort === 'RATING') {
      list = [...list].sort((a, b) => b.starRating - a.starRating);
    } else if (qSort === 'PRICE_LOW_TO_HIGH' || qSort === 'PRICE_HIGH_TO_LOW') {
      list = [...list].sort((a, b) => {
        const minA = a.rooms.length ? Math.min(...a.rooms.map(r => r.pricePerNight)) : Infinity;
        const minB = b.rooms.length ? Math.min(...b.rooms.map(r => r.pricePerNight)) : Infinity;
        return qSort === 'PRICE_LOW_TO_HIGH' ? minA - minB : minB - minA;
      });
    }

    return list;
  }, [hotels, searchParams, ratingIdx, typeIdx, reviewsData, todayStr, tomorrowStr]);

  const resetFilters = () => {
    setSearch('');
    setCheckin(todayStr);
    setCheckout(tomorrowStr);
    setRoomsCount(1);
    setAdultsCount(2);
    setChildrenCount(0);
    setRatingIdx(0);
    setTypeIdx(0);
    setSearchParams({
      checkin: todayStr,
      checkout: tomorrowStr,
      search: '',
      rooms: '1,2,0',
      sort: 'POPULARITY'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* ── Page header ── */}
      <div className="pt-24 pb-20 bg-gradient-to-r from-[#000269] to-[#001a99] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-2">Find Your Stay</p>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Hotels & Resorts</h1>
          <p className="text-slate-200 text-sm max-w-xl mx-auto opacity-90">
            Book perfect accommodations, from luxury resorts to cozy city hotels.
          </p>
        </div>
      </div>

      {/* ── GoZayaan Premium Search Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Location field */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 px-3">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">City / Area / Hotel</label>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#000269] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="e.g. Cox's Bazar, Dhaka"
                className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Check-In */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 px-3">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Check In</label>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#000269] shrink-0" />
              <input
                type="date"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Check-Out */}
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 px-3">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Check Out</label>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#000269] shrink-0" />
              <input
                type="date"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="lg:col-span-3 pb-3 lg:pb-0 px-3 relative" ref={guestDropdownRef}>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rooms & Guests</label>
            <button
              type="button"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="flex items-center gap-2 w-full text-left focus:outline-none"
            >
              <Users size={16} className="text-[#000269] shrink-0" />
              <span className="text-sm font-semibold text-slate-800">
                {roomsCount} Room, {adultsCount + childrenCount} Guest{(adultsCount + childrenCount) !== 1 ? 's' : ''}
              </span>
              <ChevronDown size={14} className="text-slate-400 ml-auto" />
            </button>

            {/* Dropdown Card */}
            {showGuestDropdown && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <h4 className="font-bold text-sm text-slate-800 border-b border-slate-50 pb-2">Select Guests & Rooms</h4>
                
                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-800">Rooms</p>
                    <p className="text-xs text-slate-400">Total rooms to book</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRoomsCount(p => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >-</button>
                    <span className="font-bold text-sm text-slate-800 w-4 text-center">{roomsCount}</span>
                    <button
                      type="button"
                      onClick={() => setRoomsCount(p => Math.min(10, p + 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >+</button>
                  </div>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-800">Adults</p>
                    <p className="text-xs text-slate-400">Age 12 or above</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdultsCount(p => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >-</button>
                    <span className="font-bold text-sm text-slate-800 w-4 text-center">{adultsCount}</span>
                    <button
                      type="button"
                      onClick={() => setAdultsCount(p => Math.min(20, p + 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >+</button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-800">Children</p>
                    <p className="text-xs text-slate-400">Age 0 to 11</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setChildrenCount(p => Math.max(0, p - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >-</button>
                    <span className="font-bold text-sm text-slate-800 w-4 text-center">{childrenCount}</span>
                    <button
                      type="button"
                      onClick={() => setChildrenCount(p => Math.min(10, p + 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-[#000269]"
                    >+</button>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => setShowGuestDropdown(false)}
                  className="w-full bg-[#000269] hover:bg-[#001a99] text-white py-2 rounded-xl text-sm font-bold transition-colors mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-yellow-200"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <p className="text-sm font-semibold text-slate-500">
            {loading ? 'Loading...' : `${filtered.length} propert${filtered.length !== 1 ? 'ies' : 'y'} found`}
          </p>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold"
              style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}
              onClick={() => setMobileFilter(p => !p)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            {/* Sort */}
            <select
              value={searchParams.get('sort') || 'POPULARITY'} 
              onChange={e => handleSortChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#000269] bg-white transition-colors cursor-pointer text-slate-800"
            >
              <option value="POPULARITY">Popularity</option>
              <option value="PRICE_LOW_TO_HIGH">Price: Low → High</option>
              <option value="PRICE_HIGH_TO_LOW">Price: High → Low</option>
              <option value="RATING">Star Rating</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`${mobileFilter ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel
              search={search} setSearch={setSearch}
              ratingIdx={ratingIdx} setRatingIdx={setRatingIdx}
              typeIdx={typeIdx} setTypeIdx={setTypeIdx}
              onReset={resetFilters}
            />
          </div>

          {/* List */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-5">
                <SkeletonCards count={3} />
              </div>
            ) : filtered.length > 0 ? (
              <div className="flex flex-col gap-5">
                {filtered.map(hotel => (
                  <HotelListCard 
                    key={hotel.hotelId} 
                    hotel={hotel} 
                    reviewCount={reviewsData[hotel.hotelId]?.count || 0} 
                    averageRating={reviewsData[hotel.hotelId]?.average || 0} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>No hotels found</h3>
                <p className="text-sm text-slate-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsListPage;

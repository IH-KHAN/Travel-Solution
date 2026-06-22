import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, ChevronLeft, ArrowRight, X, ImageOff, AlertCircle, Loader,
  Camera, CheckCircle, Wifi, Coffee, Car, ShieldCheck, User, Star, Hotel
} from 'lucide-react';
import { useHotelById, type RoomDetailDTO } from '@/hooks/useHotels';
import StarRating from '@/components/client/ui/StarRating';
import BookHotelModal from '@/components/client/hotels/BookHotelModal';
import api from '@/lib/api';

const BASE_URL = 'http://localhost:5246';

// ── Dummy Amenities ────────────────────────────────────────────────
const AMENITIES = [
  { icon: Wifi, label: 'Free High-Speed WiFi' },
  { icon: Coffee, label: 'Breakfast Included' },
  { icon: Car, label: 'Free Parking' },
  { icon: ShieldCheck, label: '24/7 Security' },
];

import LightboxGallery from '@/components/client/ui/LightboxGallery';

// ── Detail Page ───────────────────────────────────────────────────
const HotelDetailPage: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const { hotel, loading, error } = useHotelById(id ? Number(id) : null);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [preselectRoomKey, setPreselectRoomKey] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab]     = useState<'overview' | 'rooms' | 'gallery' | 'reviews'>('overview');

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const { data } = await api.get('/Reviews');
        const filtered = data.filter((r: any) => r.hotelId === Number(id));
        setReviews(filtered);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : hotel?.userRating || 0;

  // Images
  const galleryImages = (hotel?.hotelImages ?? [])
    .map(p => p.hotelImageUrl ? (p.hotelImageUrl.startsWith('http') ? p.hotelImageUrl : `${BASE_URL}${p.hotelImageUrl}`) : null)
    .filter(Boolean) as string[];

  const coverImg = hotel?.coverImage
    ? hotel.coverImage.startsWith('http') ? hotel.coverImage : `${BASE_URL}${hotel.coverImage}`
    : galleryImages[0] ?? null;

  const lowestPrice = hotel?.rooms.length
    ? Math.min(...hotel.rooms.map(r => r.pricePerNight))
    : 0;

  const handleBookRoom = (roomKey?: string) => {
    setPreselectRoomKey(roomKey ?? null);
    setShowBooking(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader size={36} className="animate-spin" style={{ color: 'var(--brand-navy)' }} />
    </div>
  );

  if (error || !hotel) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 pt-20">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>Hotel Not Found</h2>
      <p className="text-slate-400 text-sm">{error}</p>
      <Link to="/hotels" className="btn-brand px-6 py-3 rounded-xl text-sm font-bold mt-2">
        Back to Hotels
      </Link>
    </div>
  );

  const TABS = ['overview', 'rooms', 'gallery', 'reviews'] as const;

  return (
    <>
      {lightboxIdx !== null && (
        <LightboxGallery images={galleryImages} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      )}

      {showBooking && (
        <BookHotelModal hotel={hotel} selectedRoomKey={preselectRoomKey} onClose={() => setShowBooking(false)} />
      )}

      {/* ── Hero banner ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {coverImg ? (
          <img src={coverImg} alt={hotel.hotelName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
            <ImageOff size={48} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,2,105,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

        <div className="absolute top-20 left-0 right-0 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <Link to="/hotels" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
              <ChevronLeft size={16} /> All Hotels
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-navy-900" style={{ color: 'var(--brand-navy)' }}>
                {hotel.accommodationType ?? 'Hotel'}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white flex items-center gap-1">
                {averageRating > 0 ? <><Star size={12} className="fill-white" /> {averageRating.toFixed(1)} / 5.0</> : 'No ratings yet'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-2">
              {hotel.hotelName}
            </h1>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin size={16} className="text-yellow-400" />
              {hotel.address}, {hotel.cityArea}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Content ── */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex border-b-2 border-slate-100 mb-8 overflow-x-auto hide-scrollbar gap-1">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-[2px] transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab ? 'border-yellow-400' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                  style={activeTab === tab ? { color: 'var(--brand-navy)' } : {}}>
                  {tab} {tab === 'rooms' && `(${hotel.rooms.length})`} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {hotel.description && (
                  <div>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>About the Property</h2>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{hotel.description}</p>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-navy)' }}>Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {AMENITIES.map(({ icon: Icon, label }) => (
                      <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
                        <Icon size={24} style={{ color: 'var(--brand-navy)' }} className="opacity-80" />
                        <span className="text-xs font-semibold text-slate-600">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {hotel.policy && (
                  <div>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>Hotel Policies</h2>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                      {hotel.policy}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ROOMS ── */}
            {activeTab === 'rooms' && (
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>Available Rooms</h2>
                {hotel.rooms.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p>No rooms listed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const splitRooms: Array<RoomDetailDTO & { virtualRoomView?: string | null }> = [];
                      hotel.rooms.forEach(room => {
                        const unitsByView: Record<string, typeof room.roomUnits> = {};
                        room.roomUnits?.forEach(unit => {
                          const view = unit.roomView || 'Standard';
                          if (!unitsByView[view]) {
                            unitsByView[view] = [];
                          }
                          unitsByView[view].push(unit);
                        });
                        const views = Object.keys(unitsByView);
                        if (views.length <= 1) {
                          splitRooms.push({
                            ...room,
                            virtualRoomView: views[0] !== 'Standard' ? views[0] : null
                          });
                        } else {
                          views.forEach(view => {
                            const units = unitsByView[view];
                            const activeUnitsCount = units.filter(u => u.isAvailable).length;
                            splitRooms.push({
                              ...room,
                              virtualRoomView: view !== 'Standard' ? view : null,
                              totalUnits: activeUnitsCount,
                              roomUnits: units,
                            });
                          });
                        }
                      });

                      return splitRooms.map((room, idx) => {
                        let availableToday = room.totalUnits || 1;
                        if (!room.isAvailable) availableToday = 0;
                        else if (room.bookedDates && room.bookedDates.length > 0) {
                          const today = new Date();
                          today.setHours(0,0,0,0);
                          const tomorrow = new Date(today);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const inTime = today.getTime();
                          const outTime = tomorrow.getTime();
                          let bookedCount = 0;
                          for (const b of room.bookedDates) {
                            const bookedView = b.roomView || 'Standard';
                            const currentView = room.virtualRoomView || 'Standard';
                            if (bookedView === currentView) {
                              const bIn = new Date(b.checkIn).getTime();
                              const bOut = new Date(b.checkOut).getTime();
                              if (inTime < bOut && outTime > bIn) {
                                bookedCount += b.quantity || 1;
                              }
                            }
                          }
                          availableToday = Math.max(0, availableToday - bookedCount);
                        }

                        const uniqueKey = `${room.roomId}_${room.virtualRoomView || 'Standard'}`;

                        return (
                          <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-5">
                            
                            {/* Room Image */}
                            <div className="w-full sm:w-48 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                              {room.room_Images?.[0]?.imageUrl ? (
                                <img src={`${BASE_URL}${room.room_Images[0].imageUrl}`} alt="Room" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                  <Hotel className="text-slate-400 opacity-50" size={32} />
                                </div>
                              )}
                              {availableToday === 0 ? (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Sold Out Today</span>
                                </div>
                              ) : (
                                <div className="absolute top-2 right-2">
                                  <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                                    {availableToday} {availableToday === 1 ? 'Unit' : 'Units'} Vacant Today
                                  </span>
                                </div>
                              )}
                            </div>
    
                            {/* Room Info */}
                            <div className="flex-1 flex flex-col min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg leading-tight flex flex-wrap items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                                    {room.roomTypeName || 'Standard Room'}
                                    {room.virtualRoomView && (
                                      <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                        {room.virtualRoomView} View
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-semibold mt-1">
                                    Available Today: {availableToday} {availableToday === 1 ? 'room' : 'rooms'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs text-slate-400 block">per night</span>
                                  <span className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                                    ৳{room.pricePerNight.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                {room.description || 'Enjoy a comfortable stay in our well-appointed room featuring modern amenities and cozy bedding.'}
                              </p>
    
                              <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                    <User size={12} /> Max {room.maxGuest} Guests
                                  </span>
                                  {room.virtualRoomView && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                                      <Camera size={12} /> {room.virtualRoomView} View
                                    </span>
                                  )}
                                </div>
                                
                                <button
                                  disabled={!room.isAvailable || availableToday === 0}
                                  onClick={() => handleBookRoom(uniqueKey)}
                                  className="px-6 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                                  Select Room
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ── GALLERY ── */}
            {activeTab === 'gallery' && (
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>Photo Gallery</h2>
                {galleryImages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ImageOff size={36} className="mx-auto mb-3 opacity-40" />
                    <p>No photos available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryImages.map((src, i) => (
                      <button key={i} onClick={() => setLightboxIdx(i)}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer bg-slate-100">
                        <img src={src} alt={`Hotel ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Camera size={24} className="text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>Guest Reviews</h2>
                    <p className="text-sm text-slate-500">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                      {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                    </div>
                    <StarRating rating={averageRating > 0 ? Math.round(averageRating) : 0} />
                  </div>
                </div>

                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8"><Loader className="animate-spin text-slate-400" /></div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Star size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No reviews yet for this hotel. Be the first to leave one!</p>
                    </div>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.reviewId} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>
                              {(rev.userName || rev.userEmail || 'Anonymous').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: 'var(--brand-navy)' }}>{rev.userName || 'Anonymous Client'}</p>
                              <p className="text-xs text-slate-400">{rev.userEmail || 'Verified Stay'}</p>
                            </div>
                          </div>
                          <StarRating rating={rev.rating} />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{rev.reviewBody || 'No text review'}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── Right Booking Card (Sticky) ── */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-20">
              <div className="p-6" style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
                <p className="text-slate-300 text-sm mb-1">Starting from</p>
                <p className="text-4xl font-bold text-white mt-1">
                  {lowestPrice > 0 ? `৳${lowestPrice.toLocaleString()}` : 'N/A'}
                </p>
                <p className="text-slate-300 text-xs mt-1">per night, taxes included</p>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Star Rating</span>
                  <StarRating rating={hotel.starRating} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Available Rooms</span>
                  <span className="font-bold" style={{ color: 'var(--brand-navy)' }}>{hotel.rooms.filter(r => r.isAvailable).length} vacant</span>
                </div>

                <div className="pt-4 mt-2">
                  <button onClick={() => handleBookRoom()}
                    className="btn-brand w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2">
                    Book Now <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setActiveTab('rooms')}
                    className="w-full py-3 mt-3 rounded-xl text-sm font-bold border-2 transition-all duration-200"
                    style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}>
                    View All Rooms
                  </button>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <p className="text-xs text-slate-500 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Instant Confirmation</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Secure Payment</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default HotelDetailPage;

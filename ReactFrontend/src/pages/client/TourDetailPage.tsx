import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock, MapPin, Users, ChevronLeft, ArrowRight, X,
  ImageOff, AlertCircle, Loader,
  Car, Hotel, Utensils, Camera, Coffee, MoreHorizontal,
  Calendar, CheckCircle, Circle, Star
} from 'lucide-react';
import { usePackageById } from '@/hooks/usePackages';
import BookNowModal from '@/components/client/tours/BookNowModal';
import StarRating from '@/components/client/ui/StarRating';
import api from '@/lib/api';

const BASE_URL = 'http://localhost:5246';

// ── Activity type → icon + colour mapping ─────────────────────────
const ACTIVITY_META: Record<string, { icon: React.FC<{ size?: number; className?: string }>, bg: string, text: string, label: string }> = {
  Transport:    { icon: Car,          bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Transport' },
  Hotel:        { icon: Hotel,        bg: 'bg-purple-100', text: 'text-purple-700', label: 'Stay' },
  Meal:         { icon: Utensils,     bg: 'bg-orange-100', text: 'text-orange-700', label: 'Meal' },
  SpotVisit:    { icon: Camera,       bg: 'bg-green-100',  text: 'text-green-700',  label: 'Spot Visit' },
  MidwayBreak:  { icon: Coffee,       bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Break' },
  Other:        { icon: MoreHorizontal, bg: 'bg-slate-100', text: 'text-slate-600', label: 'Other' },
};

import LightboxGallery from '@/components/client/ui/LightboxGallery';

// ── Detail Page ───────────────────────────────────────────────────
const TourDetailPage: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const { pkg, loading, error } = usePackageById(id ? Number(id) : null);

  const [lightboxIdx, setLightboxIdx]   = useState<number | null>(null);
  const [showBooking, setShowBooking]   = useState(false);
  const [activeTab, setActiveTab]       = useState<'overview' | 'itinerary' | 'gallery' | 'reviews'>('overview');

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const { data } = await api.get('/Reviews');
        const filtered = data.filter((r: any) => r.packageID === Number(id));
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
    : 0;

  // Resolve image URLs
  const images = (pkg?.pictures ?? [])
    .map(p => p.picUrl ? (p.picUrl.startsWith('http') ? p.picUrl : `${BASE_URL}${p.picUrl}`) : null)
    .filter(Boolean) as string[];

  const coverImg = images[0] ?? null;

  const finalPrice = pkg
    ? pkg.packagePrice - pkg.discount + pkg.markUpAmount
    : 0;

  // Compute dynamic dates from activities
  let startDateStr = 'TBD';
  let endDateStr = 'TBD';
  if (pkg?.activities && pkg.activities.length > 0) {
    const times = pkg.activities.map(a => new Date(a.plannedTime).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    startDateStr = new Date(minTime).toLocaleDateString();
    endDateStr = new Date(maxTime).toLocaleDateString();
  }

  const tourSpots = pkg?.activities
    ?.filter(a => a.activityType === 'SpotVisit')
    ?.map(a => a.activityName)
    ?.join(', ') || 'Not specified';

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 80 }}>
      <Loader size={36} className="animate-spin" style={{ color: 'var(--brand-navy)' }} />
    </div>
  );

  // ── Error ──
  if (error || !pkg) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ paddingTop: 80 }}>
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>Package Not Found</h2>
      <p className="text-slate-400 text-sm">{error}</p>
      <Link to="/tours"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
        style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
        <ChevronLeft size={16} /> Back to Tours
      </Link>
    </div>
  );

  const TABS = ['overview', 'itinerary', 'gallery', 'reviews'] as const;

  return (
    <>
      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <LightboxGallery
          images={images} index={lightboxIdx} onClose={() => setLightboxIdx(null)}
          onNav={setLightboxIdx}
        />
      )}

      {/* ── Book Now Modal ── */}
      {showBooking && <BookNowModal pkg={pkg} onClose={() => setShowBooking(false)} />}

      {/* ── Hero banner ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden" style={{ marginTop: 0 }}>
        {coverImg ? (
          <img src={coverImg} alt={pkg.packageTitle ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
            <ImageOff size={48} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,2,105,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

        {/* Breadcrumb */}
        <div className="absolute top-20 left-0 right-0 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <Link to="/tours"
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
              <ChevronLeft size={16} /> Tour Packages
            </Link>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                <Clock size={11} className="inline mr-1" />{pkg.durationDays}D / {pkg.durationNight}N
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white">
                <Users size={11} className="inline mr-1" />Vacancy {pkg.availableVacancy}/{pkg.maxTourist}
              </span>
              {averageRating > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white flex items-center gap-1">
                  <Star size={11} className="fill-white" /> {averageRating.toFixed(1)} / 5.0
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
              {pkg.packageTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Content ── */}
          <div className="flex-1 min-w-0">

            {/* Tab bar */}
            <div className="flex border-b-2 border-slate-100 mb-8 gap-1">
              {TABS.map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-[2px] transition-all duration-200
                    ${activeTab === tab
                      ? 'border-yellow-400 text-navy-900'
                      : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                  style={activeTab === tab ? { color: 'var(--brand-navy)' } : {}}>
                  {tab} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {pkg.description && (
                  <div>
                    <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>About This Package</h2>
                    <p className="text-slate-600 leading-relaxed text-sm">{pkg.description}</p>
                  </div>
                )}

                {/* Quick facts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Clock,   label: 'Duration',    value: `${pkg.durationDays} Days / ${pkg.durationNight} Nights` },
                    { icon: Users,   label: 'Vacancy', value: `${pkg.availableVacancy}/${pkg.maxTourist}` },
                    { icon: MapPin,  label: 'Tour Spots',  value: tourSpots },
                    { icon: Calendar, label: 'Start Date',  value: startDateStr },
                    { icon: Calendar, label: 'End Date',    value: endDateStr },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'rgba(0,2,105,0.08)' }}>
                        <Icon size={16} style={{ color: 'var(--brand-navy)' }} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className="text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activities summary */}
                {pkg.activities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-navy)' }}>What's Included</h2>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(pkg.activities.map(a => a.activityType))].map(type => {
                        const meta = ACTIVITY_META[type] ?? ACTIVITY_META.Other;
                        const Icon = meta.icon;
                        return (
                          <div key={type}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${meta.bg} ${meta.text}`}>
                            <Icon size={14} /> {meta.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ITINERARY TAB ── */}
            {activeTab === 'itinerary' && (
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>
                  Full Itinerary ({pkg.activities.length} activities)
                </h2>

                {pkg.activities.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                    <p>No itinerary details available yet.</p>
                  </div>
                ) : (() => {
                  const sortedActivities = [...pkg.activities].sort((a, b) => new Date(a.plannedTime).getTime() - new Date(b.plannedTime).getTime());
                  const firstDate = new Date(sortedActivities[0].plannedTime);
                  firstDate.setHours(0, 0, 0, 0);
                  const firstMs = firstDate.getTime();

                  const grouped = sortedActivities.reduce((acc, act) => {
                    const actDate = new Date(act.plannedTime);
                    actDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.round((actDate.getTime() - firstMs) / (1000 * 60 * 60 * 24));
                    const dayNum = diffDays + 1;
                    
                    if (!acc[dayNum]) acc[dayNum] = [];
                    acc[dayNum].push(act);
                    return acc;
                  }, {} as Record<number, typeof pkg.activities>);

                  return (
                    <div className="space-y-10">
                      {Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map((dayStr) => {
                        const dayNum = Number(dayStr);
                        const dayActivities = grouped[dayNum];
                        const dateObj = new Date(dayActivities[0].plannedTime);

                        return (
                          <div key={dayNum} className="relative">
                            <div className="sticky top-20 z-10 bg-white/90 backdrop-blur-md py-3 mb-6 border-l-4 border-yellow-400 pl-4 rounded-r-xl shadow-sm">
                              <h3 className="text-lg font-bold" style={{ color: 'var(--brand-navy)' }}>Day {dayNum}</h3>
                              <p className="text-sm font-medium text-slate-500">
                                {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            
                            <div className="relative">
                              {/* Timeline line */}
                              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />

                              <div className="space-y-4">
                                {dayActivities.map((act, idx) => {
                                  const meta = ACTIVITY_META[act.activityType] ?? ACTIVITY_META.Other;
                                  const Icon = meta.icon;
                                  return (
                                    <div key={act.activityId} className="relative flex gap-4 pl-14">
                                      {/* Circle on timeline */}
                                      <div className={`absolute left-0 w-11 h-11 rounded-full border-2 border-white shadow-sm flex items-center justify-center shrink-0 ${meta.bg}`}>
                                        {act.isCompleted
                                          ? <CheckCircle size={18} className="text-emerald-500" />
                                          : <Icon size={18} className={meta.text} />
                                        }
                                      </div>

                                      {/* Card */}
                                      <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                          <div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} mr-2`}>
                                              {meta.label}
                                            </span>
                                            <span className="text-xs text-slate-400">Activity {idx + 1}</span>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-xs text-slate-400">Time</p>
                                            <p className="text-xs font-semibold" style={{ color: 'var(--brand-navy)' }}>
                                              {new Date(act.plannedTime).toLocaleTimeString('en-US', {
                                                hour: '2-digit', minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                        </div>

                                        <h4 className="font-bold text-base mb-1" style={{ color: 'var(--brand-navy)' }}>
                                          {act.activityName}
                                        </h4>
                                        {act.activityDescription && (
                                          <p className="text-sm text-slate-500 leading-relaxed">{act.activityDescription}</p>
                                        )}

                                        {act.projectedCost > 0 && (
                                          <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-400">Est. Cost:</span>
                                            <span className="text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>
                                              ৳{act.projectedCost.toLocaleString()}
                                            </span>
                                          </div>
                                        )}

                                        {act.isCompleted && (
                                          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                            <CheckCircle size={12} /> Completed
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── GALLERY TAB ── */}
            {activeTab === 'gallery' && (
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>
                  Photo Gallery ({images.length} photos)
                </h2>

                {images.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ImageOff size={36} className="mx-auto mb-3 opacity-40" />
                    <p>No photos available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((src, i) => (
                      <button key={i} onClick={() => setLightboxIdx(i)}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                        <img src={src} alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>Guest Reviews</h2>
                    <p className="text-sm text-slate-500">Based on {reviews.length} verified stays</p>
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
                      <p>No reviews yet for this package. Be the first to leave one!</p>
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

          {/* ── Right: Booking card (sticky) ── */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-20">
              {/* Price header */}
              <div className="p-6" style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
                <p className="text-slate-300 text-sm mb-1">Package Price</p>
                {pkg.discount > 0 && (
                  <p className="text-slate-400 text-sm line-through">
                    ৳{Math.round(pkg.packagePrice + pkg.markUpAmount).toLocaleString()}
                  </p>
                )}
                <p className="text-4xl font-bold text-white mt-1">
                  ৳{Math.round(finalPrice > 0 ? finalPrice : pkg.packagePrice).toLocaleString()}
                </p>
                {pkg.discount > 0 && (
                  <span className="mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                    {pkg.isDiscountPercent
                      ? `${Math.round((pkg.discount / (pkg.packagePrice || 1)) * 100)}% savings!`
                      : `৳${Math.round(pkg.discount).toLocaleString()} savings!`}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                {[
                  { label: 'Duration', value: `${pkg.durationDays} Days / ${pkg.durationNight} Nights` },
                  { label: 'Vacancy', value: `${pkg.availableVacancy} / ${pkg.maxTourist}` },
                  { label: 'Activities', value: `${pkg.activities.length} activities` },
                  { label: 'Photos', value: `${images.length} photos` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="font-bold" style={{ color: 'var(--brand-navy)' }}>{value}</span>
                  </div>
                ))}

                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => setShowBooking(true)}
                    className="btn-brand w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2">
                    Book Now <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => setActiveTab('itinerary')}
                    className="w-full py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200"
                    style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}>
                    View Itinerary
                  </button>
                </div>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Free cancellation · No credit card required
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default TourDetailPage;

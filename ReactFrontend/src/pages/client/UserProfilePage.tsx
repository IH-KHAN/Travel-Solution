import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, Package, Star, Calendar, Hotel, CreditCard, ChevronRight, 
  AlertCircle, Loader, CheckCircle, XCircle, Clock, Save, Edit3, Map, RefreshCcw, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { useMyBookings } from '@/hooks/useMyBookings';
import { usePackages } from '@/hooks/usePackages';
import { useHotels } from '@/hooks/useHotels';
import { useCustomTours } from '@/hooks/useCustomTours';
import StarRating from '@/components/client/ui/StarRating';

// ── Badges ────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  const raw = status || 'Pending';
  const s = raw.toLowerCase();
  if (s === 'approved' || s === 'confirmed' || s === 'completed') {
    return (
      <span className="bg-emerald-50 text-emerald-600 border-emerald-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <CheckCircle size={12} /> {raw}
      </span>
    );
  }
  if (s === 'cancelled' || s === 'rejected') {
    return (
      <span className="bg-rose-50 text-rose-600 border-rose-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <XCircle size={12} /> {raw}
      </span>
    );
  }
  return (
    <span className="bg-amber-50 text-amber-600 border-amber-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
      <Clock size={12} /> {raw}
    </span>
  );
};

const PaymentBadge: React.FC<{ status: string | null }> = ({ status }) => {
  const s = (status || 'unpaid').toLowerCase();
  if (s === 'paid') return <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Paid</span>;
  return <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14} /> Unpaid</span>;
};

// ── Component ─────────────────────────────────────────────────────
const UserProfilePage: React.FC = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'reviews' | 'custom-tours'>('profile');
  const navigate = useNavigate();
  
  // Bookings state
  const [bookingType, setBookingType] = useState<'tours' | 'hotels'>('tours');
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const { tourBookings, hotelBookings, loading: bookingsLoading } = useMyBookings();
  const { packages } = usePackages(false);
  const { hotels }   = useHotels();
  const { customTours, loading: customToursLoading } = useCustomTours();
  const userId = Number(localStorage.getItem('userId'));
  const [downloadingMagazine, setDownloadingMagazine] = useState<{ [key: number]: boolean }>({});

  // Profile State
  const [profile, setProfile] = useState<{ userName: string, email: string, phone: string, role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalRating, setModalRating] = useState<number>(5);
  const [modalReviewBody, setModalReviewBody] = useState<string>('');
  const [modalHotelId, setModalHotelId] = useState<number | undefined>(undefined);
  const [modalPackageId, setModalPackageId] = useState<number | undefined>(undefined);
  const [modalEntityName, setModalEntityName] = useState<string>('');
  const [modalReviewId, setModalReviewId] = useState<number | undefined>(undefined);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data } = await api.get('/Reviews');
      // Filter reviews by current user ID
      setReviews(data.filter((r: any) => r.userID === userId));
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/Users/profile');
        setProfile(data);
      } catch (err) {
        toast.error('Failed to load profile details.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
    fetchReviews();
  }, []);

  const handleOpenReviewModal = (entityName: string, hotelId?: number, packageId?: number, existingReview?: any) => {
    setModalEntityName(entityName);
    setModalHotelId(hotelId);
    setModalPackageId(packageId);
    if (existingReview) {
      setModalReviewId(existingReview.reviewId);
      setModalRating(existingReview.rating);
      setModalReviewBody(existingReview.reviewBody || '');
    } else {
      setModalReviewId(undefined);
      setModalRating(5);
      setModalReviewBody('');
    }
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setModalEntityName('');
    setModalHotelId(undefined);
    setModalPackageId(undefined);
    setModalReviewId(undefined);
    setModalRating(5);
    setModalReviewBody('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalRating < 1 || modalRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars.');
      return;
    }
    try {
      setSubmittingReview(true);
      if (modalReviewId) {
        // Update review
        await api.put(`/Reviews/${modalReviewId}`, {
          reviewId: modalReviewId,
          userID: userId,
          hotelId: modalHotelId,
          packageID: modalPackageId,
          rating: modalRating,
          reviewBody: modalReviewBody
        });
        toast.success('Review updated successfully.');
      } else {
        // Create review
        await api.post('/Reviews', {
          userID: userId,
          hotelId: modalHotelId,
          packageID: modalPackageId,
          rating: modalRating,
          reviewBody: modalReviewBody
        });
        toast.success('Review submitted successfully.');
      }
      handleCloseReviewModal();
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/Reviews/${reviewId}`);
      toast.success('Review deleted successfully.');
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review.');
    }
  };

  const handlePayment = (bookingType: 'tour' | 'hotel', bookingId: number) => {
    navigate(`/payment/${bookingType}/${bookingId}`);
  };

  const handleRefundRequest = (bookingType: 'tours' | 'hotels', bookingId: number, amount: number, startDate: number) => {
    navigate(`/request-refund/${bookingType}/${bookingId}`, { state: { amount, startDate } });
  };

  const handleDownloadMagazine = async (packageId: number, packageTitle: string) => {
    try {
      setDownloadingMagazine(prev => ({ ...prev, [packageId]: true }));
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write('<html><head><title>Loading Tour Magazine...</title><style>body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #1e293b; }</style></head><body><div style="text-align: center;"><h2>Generating Tour Magazine...</h2><p style="color: #64748b;">Gathering memories and designing your magazine layout.</p></div></body></html>');
      }

      const response = await api.get(`/Magazine/packages/${packageId}/download-pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      if (pdfWindow) {
        pdfWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to download magazine:', err);
      toast.error('Failed to download magazine.');
    } finally {
      setDownloadingMagazine(prev => ({ ...prev, [packageId]: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* ── Header ── */}
      <div className="pt-24 pb-20" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-slate-300 text-sm">Manage your profile, bookings, and reviews.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 flex flex-col md:flex-row gap-6">
        
        {/* ── Left Sidebar (Vertical Tabs) ── */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'profile', icon: User, label: 'Profile Details' },
            { id: 'bookings', icon: Calendar, label: 'My Bookings' },
            { id: 'custom-tours', icon: Map, label: 'Custom Tours' },
            { id: 'reviews', icon: Star, label: 'My Reviews' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm border
                ${activeTab === tab.id ? 'border-yellow-400 bg-white text-navy-900 translate-x-1' : 'border-transparent bg-white/50 hover:bg-white text-slate-500 hover:text-slate-700'}`}
              style={activeTab === tab.id ? { color: 'var(--brand-navy)' } : {}}>
              <tab.icon size={18} className={activeTab === tab.id ? 'text-yellow-500' : ''} /> {tab.label}
            </button>
          ))}
        </aside>

        {/* ── Right Content Area ── */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                <User size={24} className="text-yellow-500" /> Profile Information
              </h2>

              {profileLoading ? (
                <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm border-4 border-slate-50"
                      style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                      {profile?.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>{profile?.userName}</h3>
                      <p className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 inline-block mt-1">
                        {profile?.role} Account
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Email Address</label>
                      <input type="email" value={profile?.email || ''} readOnly className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none text-slate-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Phone Number</label>
                      <input type="text" value={profile?.phone || ''} readOnly className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-medium bg-slate-50 focus:outline-none text-slate-500" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors hover:bg-slate-50 flex items-center gap-2 text-slate-400 cursor-not-allowed">
                      <Edit3 size={16} /> Edit Profile
                    </button>
                    <span className="text-xs text-slate-400 self-center">Editing profile details is currently disabled.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                  <Calendar size={24} className="text-yellow-500" /> My Bookings
                </h2>
                
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                  <button onClick={() => setBookingType('tours')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${bookingType === 'tours' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                    style={bookingType === 'tours' ? { color: 'var(--brand-navy)' } : {}}>
                    Tours
                  </button>
                  <button onClick={() => setBookingType('hotels')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${bookingType === 'hotels' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                    style={bookingType === 'hotels' ? { color: 'var(--brand-navy)' } : {}}>
                    Hotels
                  </button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-slate-400"/></div>
              ) : bookingType === 'tours' ? (
                <div className="space-y-4">
                  {tourBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Package size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No tour bookings yet.</p>
                      <Link to="/tours" className="text-yellow-600 font-bold mt-2 inline-block hover:underline">Explore Tours</Link>
                    </div>
                  ) : (
                    tourBookings.map(b => {
                      const pkg = packages.find(p => p.packageId === b.packageId);
                      let startDateStr = 'TBD';
                      let endDateStr = 'TBD';
                      let startDateTimestamp = Date.now() + 86400000 * 10; // Default to 10 days in future if unknown
                      if (pkg?.activities && pkg.activities.length > 0) {
                        const times = pkg.activities.map(a => new Date(a.plannedTime).getTime());
                        startDateTimestamp = Math.min(...times);
                        startDateStr = new Date(startDateTimestamp).toLocaleDateString();
                        endDateStr = new Date(Math.max(...times)).toLocaleDateString();
                      }
                      
                      const isExpanded = expandedBookingId === b.bookingId;

                      return (
                        <div key={b.bookingId} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                          {/* Row Header (Clickable) */}
                          <div 
                            className={`p-5 flex flex-col sm:flex-row gap-5 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : 'bg-white'}`}
                            onClick={() => setExpandedBookingId(isExpanded ? null : b.bookingId)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">#{b.bookingId}</span>
                                <StatusBadge status={b.status} />
                              </div>
                              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>{pkg?.packageTitle || 'Unknown Package'}</h3>
                              <div className="flex gap-6 text-sm">
                                <div><p className="text-slate-400 text-xs mb-1">Start Date</p><p className="font-bold">{startDateStr}</p></div>
                                <div><p className="text-slate-400 text-xs mb-1">End Date</p><p className="font-bold">{endDateStr}</p></div>
                                <div><p className="text-slate-400 text-xs mb-1">Amount</p><p className="font-bold">৳{b.amount.toLocaleString()}</p></div>
                              </div>
                            </div>
                            
                            <div className="sm:w-48 rounded-xl p-4 flex flex-col justify-between" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              <div><p className="text-xs font-bold text-slate-400 mb-2">Payment Status</p><PaymentBadge status={b.paymentStatus} /></div>
                              {(!b.paymentStatus || b.paymentStatus.toLowerCase() !== 'paid') && 
                               (!b.status || !['cancelled', 'rejected', 'confirmed', 'completed'].includes(b.status.toLowerCase())) && (
                                <button onClick={(e) => { e.stopPropagation(); handlePayment('tour', b.bookingId); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--brand-navy)' }}>
                                  <CreditCard size={14} /> Pay Now
                                </button>
                              )}
                              {(() => {
                                const tourStarted = pkg?.activities?.some(a => a.isCompleted || a.actualTime !== null) || false;
                                return (b.paymentStatus?.toLowerCase() === 'paid') && 
                                  (!b.status || !['cancelled', 'rejected', 'completed'].includes(b.status.toLowerCase())) && 
                                  !tourStarted && (
                                    <button onClick={(e) => { e.stopPropagation(); handleRefundRequest('tours', b.bookingId, b.amount, startDateTimestamp); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-slate-50">
                                      <RefreshCcw size={14} /> Request Refund
                                    </button>
                                  );
                              })()}
                              {b.status?.toLowerCase() === 'completed' && (
                                <>
                                  {(() => {
                                    const existingReview = reviews.find(r => r.packageID === b.packageId);
                                    return existingReview ? (
                                      <button onClick={(e) => { e.stopPropagation(); handleOpenReviewModal(pkg?.packageTitle || 'Tour Package', undefined, b.packageId, existingReview); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-amber-100">
                                        <Edit3 size={14} /> Edit Review
                                      </button>
                                    ) : (
                                      <button onClick={(e) => { e.stopPropagation(); handleOpenReviewModal(pkg?.packageTitle || 'Tour Package', undefined, b.packageId); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-emerald-100">
                                        <Star size={14} className="fill-emerald-700" /> Write Review
                                      </button>
                                    );
                                  })()}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownloadMagazine(b.packageId, pkg?.packageTitle || 'Tour'); }} 
                                    disabled={downloadingMagazine[b.packageId]}
                                    className="mt-2 w-full py-2 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-purple-100 disabled:opacity-50">
                                    {downloadingMagazine[b.packageId] ? <Loader size={14} className="animate-spin" /> : <BookOpen size={14} className="text-purple-700" />}
                                    {downloadingMagazine[b.packageId] ? 'Generating...' : 'Download Magazine'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="bg-white border-t border-slate-100 p-5 px-6">
                              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <User size={16} /> Traveller Details ({b.travellers?.length || 0})
                              </h4>
                              {b.travellers && b.travellers.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 bg-slate-50 uppercase font-semibold">
                                      <tr>
                                        <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Age</th>
                                        <th className="px-4 py-3 rounded-tr-lg rounded-br-lg">Gender</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {b.travellers.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-4 py-3 font-medium text-slate-700">{t.travellerName}</td>
                                          <td className="px-4 py-3 text-slate-500">{t.email || '-'}</td>
                                          <td className="px-4 py-3 text-slate-500">{t.phone}</td>
                                          <td className="px-4 py-3 text-slate-500">{t.age}</td>
                                          <td className="px-4 py-3 text-slate-500 capitalize">{t.gender}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">No traveller details found.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Hotel size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hotel reservations yet.</p>
                      <Link to="/hotels" className="text-yellow-600 font-bold mt-2 inline-block hover:underline">Find Hotels</Link>
                    </div>
                  ) : (
                    hotelBookings.map(b => {
                      const hotel = hotels.find(h => h.hotelId === b.hotelID);
                      return (
                        <div key={b.hotelBookingID} className="border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">#{b.hotelBookingID}</span>
                              <StatusBadge status={b.bookingStatus} />
                            </div>
                            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>{b.hotelName || hotel?.hotelName || 'Unknown Hotel'}</h3>
                            <div className="flex gap-6 text-sm mb-4">
                              <div><p className="text-slate-400 text-xs mb-1">Check In</p><p className="font-bold">{new Date(b.checkInDate).toLocaleDateString()}</p></div>
                              <div><p className="text-slate-400 text-xs mb-1">Check Out</p><p className="font-bold">{new Date(b.checkOutDate).toLocaleDateString()}</p></div>
                            </div>
                            {b.rooms && b.rooms.length > 0 && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Reserved Rooms & Units</p>
                                <div className="space-y-1.5 text-xs text-slate-600">
                                  {b.rooms.map(r => (
                                    <div key={r.hotelBookingRoomID} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg font-medium border border-slate-100">
                                      <span>{r.quantity}x {r.roomTypeName || 'Standard Room'}</span>
                                      {r.assignedRoomNumbers ? (
                                        <span className="text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded font-bold">
                                          Units: {r.assignedRoomNumbers} {r.assignedFloors ? `(Fl: ${r.assignedFloors})` : ''}
                                        </span>
                                      ) : (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-semibold">Assigned on check-in</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="sm:w-48 bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                            <div><p className="text-xs font-bold text-slate-400 mb-1">Total Fare</p><p className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>৳{b.fareTotal.toLocaleString()}</p></div>
                            {(!b.paymentStatus || b.paymentStatus.toLowerCase() !== 'paid') && 
                             (!b.bookingStatus || !['cancelled', 'rejected', 'confirmed', 'completed'].includes(b.bookingStatus.toLowerCase())) && (
                              <button onClick={() => handlePayment('hotel', b.hotelBookingID)} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--brand-navy)' }}>
                                <CreditCard size={14} /> Pay Now
                              </button>
                            )}
                            {(b.paymentStatus?.toLowerCase() === 'paid') && 
                             (!b.bookingStatus || !['cancelled', 'rejected', 'confirmed', 'approved', 'completed'].includes(b.bookingStatus.toLowerCase())) && (
                              <button onClick={(e) => { e.stopPropagation(); handleRefundRequest('hotels', b.hotelBookingID, b.fareTotal, new Date(b.checkInDate).getTime()); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-slate-50">
                                <RefreshCcw size={14} /> Request Refund
                              </button>
                            )}
                            {b.bookingStatus?.toLowerCase() === 'completed' && (
                              (() => {
                                const existingReview = reviews.find(r => r.hotelId === b.hotelID);
                                return existingReview ? (
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenReviewModal(hotel?.hotelName || b.hotelName || 'Hotel', b.hotelID, undefined, existingReview); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-amber-100">
                                    <Edit3 size={14} /> Edit Review
                                  </button>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); handleOpenReviewModal(hotel?.hotelName || b.hotelName || 'Hotel', b.hotelID, undefined); }} className="mt-4 w-full py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors hover:bg-emerald-100">
                                    <Star size={14} className="fill-emerald-700" /> Write Review
                                  </button>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* CUSTOM TOURS TAB */}
          {activeTab === 'custom-tours' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                <Map size={24} className="text-yellow-500" /> My Custom Tours
              </h2>
              
              {customToursLoading ? (
                <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-slate-400"/></div>
              ) : (
                <div className="space-y-4">
                  {customTours.filter(c => c.userID === userId).length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Map size={48} className="mx-auto mb-3 opacity-20" />
                      <p>You haven't requested any custom tours yet.</p>
                      <Link to="/request-custom-tour" className="text-yellow-600 font-bold mt-2 inline-block hover:underline">Request One Now</Link>
                    </div>
                  ) : (
                    customTours.filter(c => c.userID === userId).map(c => (
                      <div key={c.customTourRequestId} className="border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:border-yellow-400 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">#{c.customTourRequestId}</span>
                            <StatusBadge status={c.status} />
                          </div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>Custom Tour Request</h3>
                          <div className="flex gap-6 text-sm mb-3">
                            <div><p className="text-slate-400 text-xs mb-1">Dates</p><p className="font-bold">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</p></div>
                            <div><p className="text-slate-400 text-xs mb-1">Travelers</p><p className="font-bold">{c.numOfTravelers}</p></div>
                            <div><p className="text-slate-400 text-xs mb-1">Budget</p><p className="font-bold">৳{c.totalBudget.toLocaleString()}</p></div>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs mb-1">Requirements</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                <Star size={24} className="text-yellow-500" /> My Reviews
              </h2>

              {reviewsLoading ? (
                <div className="flex justify-center py-20"><Loader size={24} className="animate-spin text-slate-400" /></div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Star size={48} className="mx-auto mb-3 opacity-20" />
                  <p>You haven't submitted any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.reviewId} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors bg-white shadow-sm flex flex-col justify-between md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 capitalize">
                            {rev.hotelId ? 'Hotel' : 'Tour'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">Review ID: #{rev.reviewId}</span>
                        </div>
                        <h4 className="font-bold text-lg leading-tight mb-2" style={{ color: 'var(--brand-navy)' }}>
                          {rev.hotelId ? (rev.hotelName || 'Hotel Review') : (rev.packageTitle || 'Tour Review')}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{rev.reviewBody || 'No text review'}"</p>
                      </div>
                      <div className="flex flex-col justify-between items-end shrink-0 gap-3">
                        <StarRating rating={rev.rating} />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenReviewModal(
                              rev.hotelId ? (rev.hotelName || 'Hotel') : (rev.packageTitle || 'Tour'),
                              rev.hotelId || undefined,
                              rev.packageID || undefined,
                              rev
                            )}
                            className="p-2 rounded-xl text-slate-500 hover:text-navy-900 bg-slate-50 hover:bg-slate-100 transition-colors"
                            title="Edit Review"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.reviewId)}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                            title="Delete Review"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── REVIEW MODAL OVERLAY ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
              {modalReviewId ? 'Edit Review' : 'Write a Review'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">For: <strong className="text-slate-800">{modalEntityName}</strong></p>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setModalRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={star <= modalRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Review Details</label>
                <textarea
                  value={modalReviewBody}
                  onChange={(e) => setModalReviewBody(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Share your experience (optional, up to 1000 characters)..."
                  className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {modalReviewBody.length}/1000 characters
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--brand-navy)' }}
                >
                  {submittingReview ? (
                    <Loader size={16} className="animate-spin" />
                  ) : modalReviewId ? (
                    'Save Changes'
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

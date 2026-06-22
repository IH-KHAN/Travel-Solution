import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Package, Hotel, Calendar, CreditCard, ChevronRight, 
  AlertCircle, Loader, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useMyBookings, type TourBookingDTO, type HotelBookingDTO } from '@/hooks/useMyBookings';
import { usePackages } from '@/hooks/usePackages';
import { useHotels } from '@/hooks/useHotels';

// ── Badges ────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  const displayStatus = status || 'Pending';
  const s = displayStatus.toLowerCase();

  if (s === 'approved' || s === 'confirmed') {
    return <span className="bg-emerald-50 text-emerald-600 border-emerald-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Confirmed</span>;
  }
  if (s === 'completed') {
    return <span className="bg-blue-50 text-blue-600 border-blue-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Completed</span>;
  }
  if (s === 'cancelled' || s === 'rejected') {
    return <span className="bg-rose-50 text-rose-600 border-rose-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> Cancelled</span>;
  }
  if (s === 'pending') {
    return <span className="bg-amber-50 text-amber-600 border-amber-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>;
  }

  // Fallback: Dynamically render whatever custom status the admin entered
  return (
    <span className="bg-slate-50 text-slate-600 border-slate-200 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
      <Clock size={12} /> {displayStatus}
    </span>
  );
};

const PaymentBadge: React.FC<{ status: string | null }> = ({ status }) => {
  const s = (status || 'unpaid').toLowerCase();
  if (s === 'paid') {
    return <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Paid</span>;
  }
  return <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14} /> Unpaid</span>;
};

// ── Page Component ────────────────────────────────────────────────
const MyBookingsPage: React.FC = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const { tourBookings, hotelBookings, loading, error } = useMyBookings();
  const { packages } = usePackages(false);
  const { hotels }   = useHotels();

  const [activeTab, setActiveTab] = useState<'tours' | 'hotels'>('tours');

  const navigate = useNavigate();

  const handlePayment = (bookingType: 'tour' | 'hotel', bookingId: number) => {
    navigate(`/payment/${bookingType}/${bookingId}`);
  };

  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader size={36} className="animate-spin" style={{ color: 'var(--brand-navy)' }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* Header */}
      <div className="pt-24 pb-12" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-slate-300 text-sm">Manage your upcoming trips and hotel reservations.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-8">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b-2 border-slate-100 mb-6 gap-6">
            <button onClick={() => setActiveTab('tours')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2
                ${activeTab === 'tours' ? 'border-yellow-400 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              style={activeTab === 'tours' ? { color: 'var(--brand-navy)' } : {}}>
              <Package size={16} /> Tour Packages ({tourBookings.length})
            </button>
            <button onClick={() => setActiveTab('hotels')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2
                ${activeTab === 'hotels' ? 'border-yellow-400 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              style={activeTab === 'hotels' ? { color: 'var(--brand-navy)' } : {}}>
              <Hotel size={16} /> Hotels ({hotelBookings.length})
            </button>
          </div>

          {/* Tours List */}
          {activeTab === 'tours' && (
            <div className="space-y-4">
              {tourBookings.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No tour bookings found.</p>
                  <Link to="/tours" className="text-yellow-600 font-bold mt-2 inline-block hover:underline">Explore Tours</Link>
                </div>
              ) : (
                tourBookings.map(b => {
                  const pkg = packages.find(p => p.packageId === b.packageId);
                  let travelDateStr = 'TBD';
                  if (pkg?.activities && pkg.activities.length > 0) {
                    const times = pkg.activities.map(a => new Date(a.plannedTime).getTime());
                    travelDateStr = new Date(Math.min(...times)).toLocaleDateString();
                  }
                  return (
                    <div key={b.bookingId} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Booking #{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>
                          {pkg?.packageTitle || 'Unknown Package'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs font-semibold mb-1">Travel Date</p>
                            <p className="font-bold flex items-center gap-1.5"><Calendar size={14} className="text-yellow-500"/> {travelDateStr}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs font-semibold mb-1">Amount</p>
                            <p className="font-bold">৳{b.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:w-48 bg-slate-50 rounded-xl p-4 flex flex-col justify-between shrink-0 border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-2">Payment Status</p>
                          <PaymentBadge status={b.paymentStatus} />
                        </div>
                        {(!b.paymentStatus || b.paymentStatus.toLowerCase() !== 'paid') && 
                         (!b.status || !['cancelled', 'rejected'].includes(b.status.toLowerCase())) && (
                          <button onClick={() => handlePayment('tour', b.bookingId)} className="mt-4 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: 'var(--brand-navy)', color: 'white' }}>
                            <CreditCard size={14} /> Pay Now
                          </button>
                        )}
                        {pkg && (
                          <Link to={`/tours/${b.packageId}`} className="mt-3 text-xs font-bold text-center flex items-center justify-center gap-1 hover:underline" style={{ color: 'var(--brand-navy)' }}>
                            View Package <ChevronRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Hotels List */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              {hotelBookings.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Hotel size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No hotel reservations found.</p>
                  <Link to="/hotels" className="text-yellow-600 font-bold mt-2 inline-block hover:underline">Find Hotels</Link>
                </div>
              ) : (
                hotelBookings.map(b => {
                  const hotel = hotels.find(h => h.hotelId === b.hotelID);
                  return (
                    <div key={b.hotelBookingID} className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reservation #{b.hotelBookingID}</span>
                          <StatusBadge status={b.bookingStatus} />
                        </div>
                        <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--brand-navy)' }}>
                          {hotel?.hotelName || 'Unknown Hotel'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs font-semibold mb-1">Check In</p>
                            <p className="font-bold flex items-center gap-1.5"><Calendar size={14} className="text-yellow-500"/> {new Date(b.checkInDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs font-semibold mb-1">Check Out</p>
                            <p className="font-bold flex items-center gap-1.5"><Calendar size={14} className="text-yellow-500"/> {new Date(b.checkOutDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:w-48 bg-slate-50 rounded-xl p-4 flex flex-col justify-between shrink-0 border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-2">Payment Status</p>
                          <PaymentBadge status={b.paymentStatus} />
                          
                          <p className="text-xs font-bold text-slate-400 mb-1 mt-3">Total Fare</p>
                          <p className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>৳{b.fareTotal.toLocaleString()}</p>
                        </div>
                        {(!b.paymentStatus || b.paymentStatus.toLowerCase() !== 'paid') && 
                         (!b.bookingStatus || !['cancelled', 'rejected'].includes(b.bookingStatus.toLowerCase())) && (
                          <button onClick={() => handlePayment('hotel', b.hotelBookingID)} className="mt-4 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: 'var(--brand-navy)', color: 'white' }}>
                            <CreditCard size={14} /> Pay Now
                          </button>
                        )}
                        {hotel && (
                          <Link to={`/hotels/${b.hotelID}`} className="mt-3 text-xs font-bold text-center flex items-center justify-center gap-1 hover:underline" style={{ color: 'var(--brand-navy)' }}>
                            View Hotel <ChevronRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;

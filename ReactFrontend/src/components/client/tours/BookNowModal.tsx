import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createBooking, type PackageMasterDTO } from '@/hooks/usePackages';

interface BookNowModalProps {
  pkg: PackageMasterDTO;
  onClose: () => void;
}

interface TravellerDetail {
  travellerName: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
}

const BookNowModal: React.FC<BookNowModalProps> = ({ pkg, onClose }) => {
  const userId = Number(localStorage.getItem('userId') ?? 0);
  const token  = localStorage.getItem('token');
  const navigate = useNavigate();

  const finalPrice = pkg.packagePrice - pkg.discount + pkg.markUpAmount;

  const [travellersCount, setTravellersCount] = useState(1);
  const [travellerDetails, setTravellerDetails] = useState<TravellerDetail[]>([
    { travellerName: '', phone: '', email: '', age: 0, gender: '' }
  ]);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const totalAmount = finalPrice * travellersCount;

  // Sync travellerDetails array with travellersCount
  useEffect(() => {
    setTravellerDetails(prev => {
      const newDetails = [...prev];
      if (travellersCount > prev.length) {
        for (let i = prev.length; i < travellersCount; i++) {
          newDetails.push({ travellerName: '', phone: '', email: '', age: 0, gender: '' });
        }
      } else if (travellersCount < prev.length) {
        newDetails.splice(travellersCount);
      }
      return newDetails;
    });
  }, [travellersCount]);

  const updateTraveller = (index: number, field: keyof TravellerDetail, value: string | number) => {
    setTravellerDetails(prev => {
      const newDetails = [...prev];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return newDetails;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !userId) {
      toast.error('Please sign in to make a booking.');
      return;
    }
    
    // Validate travellers
    for (let i = 0; i < travellerDetails.length; i++) {
      const t = travellerDetails[i];
      if (!t.travellerName || !t.phone || !t.email || t.age <= 0 || !t.gender) {
        toast.error(`Please fill in all details for Traveller ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await createBooking({
        userId,
        packageId:     pkg.packageId,
        amount:        totalAmount,
        status:        'Pending',
        paymentStatus: 'Unpaid',
        createdAt:     new Date().toISOString(),
        travellers:    travellerDetails
      });
      toast.success('Booking created! Redirecting to payment...');
      const newId = result?.bookingId ?? result?.id ?? result;
      onClose();
      navigate(`/payment/tour/${newId}`);
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0"
          style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
          <div>
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-1">Book Now</p>
            <h2 className="text-white font-bold text-lg leading-snug line-clamp-2">{pkg.packageTitle}</h2>
            <p className="text-slate-300 text-sm mt-1">
              {pkg.durationDays} Days / {pkg.durationNight} Nights
            </p>
          </div>
          <button onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 ml-3">
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto flex-1">
          {success ? (
            /* Success state */
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#d1fae5' }}>
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>Booking Submitted!</h3>
              <p className="text-slate-500 text-sm mb-6">
                Your booking for <strong>{pkg.packageTitle}</strong> is pending confirmation.
                We'll notify you soon.
              </p>
              <button onClick={onClose}
                className="btn-brand px-8 py-3 rounded-xl text-sm font-bold">
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {!token && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  You must <a href="/login" className="font-bold underline">sign in</a> to complete a booking.
                </div>
              )}

              {/* Price summary */}
              <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--brand-yellow)', backgroundColor: '#fffbe6' }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Price per person</span>
                  <span className="font-bold" style={{ color: 'var(--brand-navy)' }}>
                    ৳{Math.round(finalPrice > 0 ? finalPrice : pkg.packagePrice).toLocaleString()}
                  </span>
                </div>
                {pkg.discount > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-bold text-emerald-600">
                      {pkg.isDiscountPercent
                        ? `-${Math.round((pkg.discount / (pkg.packagePrice || 1)) * 100)}% (-৳${Math.round(pkg.discount).toLocaleString()})`
                        : `-৳${Math.round(pkg.discount).toLocaleString()}`}
                    </span>
                  </div>
                )}
                <div className="border-t border-yellow-200 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-sm" style={{ color: 'var(--brand-navy)' }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                    ৳{Math.round(totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Travellers Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <Users size={12} className="inline mr-1" /> Number of Travellers *
                </label>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setTravellersCount(p => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-yellow-400 transition-colors"
                    style={{ color: 'var(--brand-navy)' }}>−</button>
                  <span className="flex-1 text-center text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                    {travellersCount}
                  </span>
                  <button type="button"
                    onClick={() => setTravellersCount(p => Math.min(pkg.availableVacancy, p + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-yellow-400 transition-colors"
                    style={{ color: 'var(--brand-navy)' }}>+</button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 text-center">Max {pkg.availableVacancy} travellers (Vacancy)</p>
              </div>

              {/* Dynamic Traveller Details Forms */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100 pb-2">
                  Traveller Details
                </label>
                {travellerDetails.map((t, index) => (
                  <div key={index} className="p-4 border-2 border-slate-100 rounded-xl space-y-3 bg-slate-50/50">
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>Traveller {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text" required placeholder="Full Name" value={t.travellerName}
                          onChange={e => updateTraveller(index, 'travellerName', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="tel" required placeholder="Phone Number" value={t.phone}
                          onChange={e => updateTraveller(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="email" required placeholder="Email Address" value={t.email}
                          onChange={e => updateTraveller(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="number" required placeholder="Age" min="1" value={t.age || ''}
                          onChange={e => updateTraveller(index, 'age', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                      <div>
                        <select
                          required value={t.gender}
                          onChange={e => updateTraveller(index, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400 transition-colors bg-white"
                        >
                          <option value="" disabled>Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit" disabled={loading || !token}
                  className="btn-brand w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
                  {loading ? 'Submitting...' : 'Confirm Booking'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  No payment required now. Booking is pending confirmation.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookNowModal;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Smartphone, CheckCircle, ChevronLeft,
  Package, Hotel, Loader, ShieldCheck, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { payTourBooking, payHotelBooking } from '@/lib/paymentApi';
import CardPaymentForm from '@/components/client/payment/CardPaymentForm';
import MFSPaymentForm from '@/components/client/payment/MFSPaymentForm';

// ── Types ──────────────────────────────────────────────────────────
type BookingType = 'tour' | 'hotel';
type PaymentMethod = 'card' | 'bkash' | 'nagad' | null;

interface BookingSummary {
  id: number;
  title: string;
  amount: number;
  type: BookingType;
  paymentStatus: string | null;
}

// ── Method Option Card ─────────────────────────────────────────────
const MethodCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  accent?: string;
}> = ({ selected, onClick, icon, label, subLabel, accent }) => (
  <button
    type="button" onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left"
    style={{
      borderColor: selected ? (accent || '#000269') : '#e2e8f0',
      backgroundColor: selected ? (accent ? `${accent}10` : 'rgba(0,2,105,0.05)') : 'white',
      boxShadow: selected ? `0 0 0 3px ${accent || '#000269'}22` : 'none',
    }}
  >
    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ backgroundColor: selected ? (accent || '#000269') : '#f8fafc', color: selected ? 'white' : '#64748b' }}>
      {icon}
    </div>
    <div>
      <p className="font-bold text-sm" style={{ color: selected ? (accent || '#000269') : '#1e293b' }}>{label}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-0.5">{subLabel}</p>}
    </div>
    <div className="ml-auto">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors`}
        style={{ borderColor: selected ? (accent || '#000269') : '#e2e8f0' }}>
        {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent || '#000269' }} />}
      </div>
    </div>
  </button>
);

// ── Success Screen ─────────────────────────────────────────────────
const PaymentSuccess: React.FC<{ type: BookingType; bookingId: number; amount: number }> = ({ type, bookingId, amount }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 animate-in fade-in duration-500">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
        <CheckCircle size={48} className="text-emerald-600" />
      </div>
      <h2 className="text-2xl font-black mb-2" style={{ color: '#000269' }}>Payment Successful!</h2>
      <p className="text-slate-500 text-sm mb-1">
        {type === 'tour' ? 'Tour Booking' : 'Hotel Reservation'} #{bookingId}
      </p>
      <p className="text-3xl font-black mt-3" style={{ color: '#000269' }}>৳{amount.toLocaleString()}</p>
      <p className="text-slate-400 text-xs mt-1">has been received. Your booking is confirmed.</p>

      <div className="mt-8 w-full max-w-xs p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700">
        <ShieldCheck size={16} className="inline mr-2" />
        A confirmation receipt has been sent to your registered email.
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link to="/profile"
          className="flex-1 py-3 rounded-xl font-bold text-sm text-center border-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-colors">
          My Bookings
        </Link>
        <button onClick={() => navigate('/')}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #000269, #001a99)' }}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const PaymentPage: React.FC = () => {
  const { bookingType, bookingId } = useParams<{ bookingType: string; bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking]         = useState<BookingSummary | null>(null);
  const [fetching, setFetching]       = useState(true);
  const [method, setMethod]           = useState<PaymentMethod>(null);
  const [payLoading, setPayLoading]   = useState(false);
  const [paid, setPaid]               = useState(false);

  const type    = (bookingType === 'hotel' ? 'hotel' : 'tour') as BookingType;
  const idNum   = Number(bookingId);

  // ── Fetch booking summary ───────────────────────────────────────
  useEffect(() => {
    if (!idNum) { setFetching(false); return; }
    const fetch = async () => {
      try {
        if (type === 'tour') {
          const { data } = await api.get(`/Bookings/${idNum}`);
          setBooking({
            id:     data.bookingId,
            title:  `Tour Booking #${data.bookingId}`,
            amount: data.amount,
            type:   'tour',
            paymentStatus: data.paymentStatus,
          });
          if ((data.paymentStatus || '').toLowerCase() === 'paid') setPaid(true);
        } else {
          const { data } = await api.get(`/HotelBookings/${idNum}`);
          setBooking({
            id:     data.hotelBookingID,
            title:  `Hotel Reservation #${data.hotelBookingID}`,
            amount: data.fareTotal,
            type:   'hotel',
            paymentStatus: data.paymentStatus,
          });
          if ((data.paymentStatus || '').toLowerCase() === 'paid') setPaid(true);
        }
      } catch {
        toast.error('Could not load booking details.');
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [idNum, type]);

  // ── Payment handler (shared by all methods) ─────────────────────
  const handlePay = async () => {
    setPayLoading(true);
    try {
      // Simulate processing delay for premium feel
      await new Promise(res => setTimeout(res, 2000));
      if (type === 'tour') {
        await payTourBooking(idNum);
      } else {
        await payHotelBooking(idNum);
      }
      setPaid(true);
      toast.success('Payment completed successfully!');
    } catch {
      toast.error('Payment failed. Please try again.');
      setPayLoading(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────
  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 80 }}>
      <Loader size={36} className="animate-spin" style={{ color: '#000269' }} />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ paddingTop: 80 }}>
      <p className="text-slate-500 font-semibold">Booking not found.</p>
      <Link to="/profile" className="text-sm font-bold underline" style={{ color: '#000269' }}>Back to My Bookings</Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f8fafc', paddingTop: 80 }}>

      {/* Back nav */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {paid ? (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <PaymentSuccess type={type} bookingId={booking.id} amount={booking.amount} />
          </div>
        ) : (
          <div className="space-y-5">

            {/* Booking Summary Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5" style={{ background: 'linear-gradient(135deg, #000269 0%, #001a99 100%)' }}>
                <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Order Summary</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    {type === 'hotel' ? <Hotel size={18} className="text-white" /> : <Package size={18} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-white font-bold">{booking.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">
                      {type === 'tour' ? 'Tour Package Booking' : 'Hotel Room Reservation'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-white/60 text-sm">Total Amount</p>
                  <p className="text-white text-3xl font-black">৳{booking.amount.toLocaleString()}</p>
                </div>
              </div>
              {/* Security badge */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Lock size={12} className="text-emerald-500" />
                SSL Encrypted · Secured Checkout · 256-bit Protection
              </div>
            </div>

            {/* Method Selection */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-black mb-4" style={{ color: '#000269' }}>Choose Payment Method</h2>
              <div className="space-y-3">
                <MethodCard
                  selected={method === 'card'}
                  onClick={() => setMethod('card')}
                  icon={<CreditCard size={22} />}
                  label="Bank Card"
                  subLabel="Visa · Mastercard · AMEX"
                  accent="#000269"
                />
                <MethodCard
                  selected={method === 'bkash'}
                  onClick={() => setMethod('bkash')}
                  icon="🩷"
                  label="bKash"
                  subLabel="Mobile Financial Service"
                  accent="#D72660"
                />
                <MethodCard
                  selected={method === 'nagad'}
                  onClick={() => setMethod('nagad')}
                  icon="🟠"
                  label="Nagad"
                  subLabel="Mobile Financial Service"
                  accent="#f37021"
                />
              </div>
            </div>

            {/* Payment Form */}
            {method && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-base font-black mb-5" style={{ color: '#000269' }}>
                  {method === 'card'   ? 'Card Details'
                   : method === 'bkash' ? 'bKash Payment'
                   : 'Nagad Payment'}
                </h2>
                {method === 'card' ? (
                  <CardPaymentForm
                    amount={booking.amount}
                    onPay={handlePay}
                    loading={payLoading}
                  />
                ) : (
                  <MFSPaymentForm
                    amount={booking.amount}
                    provider={method}
                    onPay={handlePay}
                    loading={payLoading}
                  />
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-center text-xs text-slate-400 pb-4">
              🔒 This is a simulated payment environment. No real transactions are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const RefundRequestPage: React.FC = () => {
  const { bookingType, bookingId } = useParams<{ bookingType: string; bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateAmount = location.state?.amount;
  const startDate = location.state?.startDate;

  const [eligibleAmount, setEligibleAmount] = useState<number>(0);
  const [refundPercentage, setRefundPercentage] = useState<number>(100);

  useEffect(() => {
    if (!stateAmount || !startDate) {
      toast.error('Booking amount not found. Please initiate refund from your profile.');
      navigate('/profile');
      return;
    }

    const diffTime = startDate - Date.now();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    let percentage = 20;
    if (diffDays > 7) {
      percentage = 100;
    } else if (diffDays >= 2) {
      percentage = 40;
    }
    
    setRefundPercentage(percentage);
    setEligibleAmount(stateAmount * (percentage / 100));

  }, [stateAmount, startDate, navigate]);

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund.');
      return;
    }
    if (!stateAmount || stateAmount <= 0) {
      toast.error('Invalid booking amount.');
      return;
    }

    setSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      
      const payload = {
        bookingId: Number(bookingId),
        bookingType: bookingType === 'tours' ? 'Tour' : 'Hotel',
        userId: userId ? Number(userId) : null,
        refundAmount: eligibleAmount,
        reason: reason,
        status: 'Pending'
      };

      await api.post('/Refunds', payload);
      toast.success('Refund request submitted successfully!');
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold"
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <RefreshCcw size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Request Refund</h1>
              <p className="text-slate-500 text-sm">
                Booking Reference: <span className="font-bold text-slate-700 uppercase">#{bookingId}</span> ({bookingType})
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <RefreshCcw size={16} /> Refund Policy
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>More than 7 days before start: <strong>100% refund</strong></li>
                  <li>Between 2 to 7 days before start: <strong>40% refund</strong></li>
                  <li>1 day before or on start day: <strong>20% refund</strong></li>
                </ul>
              </div>

              <label className="block text-sm font-bold text-slate-700 mb-2">Eligible Refund Amount (৳)</label>
              <div className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 font-bold flex justify-between items-center">
                <span>৳{eligibleAmount.toLocaleString()}</span>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">{refundPercentage}% of Total</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Total paid was ৳{stateAmount ? stateAmount.toLocaleString() : '0'}. Based on the start date of your booking, you are eligible for a {refundPercentage}% refund.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Refund</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Please describe why you are requesting a refund..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                required
              ></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 rounded-xl text-white font-bold bg-slate-800 hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundRequestPage;

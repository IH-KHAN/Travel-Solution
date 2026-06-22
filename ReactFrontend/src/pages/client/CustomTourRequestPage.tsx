import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Calendar, Users, Phone, Map, DollarSign, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomTours } from '@/hooks/useCustomTours';

const CustomTourRequestPage: React.FC = () => {
  const token = localStorage.getItem('token');
  const userIdStr = localStorage.getItem('userId');
  const navigate = useNavigate();

  if (!token || !userIdStr) {
    return <Navigate to="/login" replace />;
  }

  const userId = Number(userIdStr);
  const { createCustomTour } = useCustomTours();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    numOfTravelers: 1,
    startDate: '',
    endDate: '',
    totalBudget: 0,
    description: ''
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numOfTravelers' || name === 'totalBudget' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }

    try {
      setLoading(true);
      await createCustomTour({
        userID: userId,
        phone: formData.phone,
        numOfTravelers: formData.numOfTravelers,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalBudget: formData.totalBudget,
        description: formData.description
      });
      toast.success('Custom tour request submitted successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error('Failed to submit custom tour request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/40 border border-slate-100">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Map size={32} className="text-yellow-600" />
            </div>
            <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--brand-navy)' }}>
              Request a Custom Tour
            </h1>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              Tell us exactly what you're looking for. We'll tailor an itinerary specifically to your budget, dates, and preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <Phone size={12} className="inline mr-1" /> Phone Number *
                </label>
                <input
                  type="tel" name="phone" required
                  value={formData.phone} onChange={handleChange}
                  placeholder="e.g. +8801..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>

              {/* Number of Travelers */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <Users size={12} className="inline mr-1" /> Travelers Count *
                </label>
                <input
                  type="number" name="numOfTravelers" required min="1"
                  value={formData.numOfTravelers} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <Calendar size={12} className="inline mr-1" /> Start Date *
                </label>
                <input
                  type="date" name="startDate" required min={today}
                  value={formData.startDate} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <Calendar size={12} className="inline mr-1" /> End Date *
                </label>
                <input
                  type="date" name="endDate" required min={formData.startDate || today}
                  value={formData.endDate} onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>

              {/* Total Budget */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  <DollarSign size={12} className="inline mr-1" /> Total Estimated Budget (৳) *
                </label>
                <input
                  type="number" name="totalBudget" required min="1"
                  value={formData.totalBudget} onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                  Detailed Requirements *
                </label>
                <textarea
                  name="description" required rows={5}
                  value={formData.description} onChange={handleChange}
                  placeholder="Please provide details about your custom travel plan. Include all your desired tourist spots, hotel preferences, transportation requirements, and any other special requests here."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                  style={{ color: 'var(--brand-navy)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-6"
              style={{ backgroundColor: 'var(--brand-navy)' }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} /> Submit Request
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomTourRequestPage;

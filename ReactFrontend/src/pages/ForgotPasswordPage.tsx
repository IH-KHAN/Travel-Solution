import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/Users/forget-password', { email });
      toast.success(data.message || 'Password reset link sent.');
      setSuccess(true);
      // In a real application, you wouldn't show the token to the user,
      // but since the backend says "implement email delivery to send it",
      // we can optionally log it or just let the user know to check their email.
    } catch (err: any) {
      toast.error(err.response?.data || 'Failed to process request. Ensure the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #000269 0%, #001a99 100%)' }}>
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-yellow-400 blur-[120px]" />
        <div className="absolute top-[60%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ backgroundColor: 'var(--brand-yellow)' }}>
            <Globe size={32} style={{ color: 'var(--brand-navy)' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-300 text-sm">Enter your email to receive a reset link.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Check your email</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="w-full inline-flex items-center justify-center py-3.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Registered Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                style={{ backgroundColor: 'var(--brand-navy)', color: 'white' }}
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound size={18} />
                )}
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Remember your password?{' '}
                <Link to="/login" className="font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

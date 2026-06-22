import React, { useState } from 'react';
import { Phone, Hash, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

type MFSProvider = 'bkash' | 'nagad';

interface MFSPaymentFormProps {
  amount: number;
  provider: MFSProvider;
  onPay: () => Promise<void>;
  loading: boolean;
}

type Step = 'phone' | 'otp' | 'pin' | 'verifying';

const PROVIDER_CONFIG: Record<MFSProvider, {
  name: string;
  brandColor: string;
  lightBg: string;
  textColor: string;
  gradient: string;
  logo: string;
}> = {
  bkash: {
    name: 'bKash',
    brandColor: '#D72660',
    lightBg: '#fff0f4',
    textColor: '#D72660',
    gradient: 'linear-gradient(135deg, #D72660 0%, #ff4d8d 100%)',
    logo: '🩷',
  },
  nagad: {
    name: 'Nagad',
    brandColor: '#f37021',
    lightBg: '#fff5ee',
    textColor: '#e05e10',
    gradient: 'linear-gradient(135deg, #f37021 0%, #f7a05e 100%)',
    logo: '🟠',
  },
};

const MFSPaymentForm: React.FC<MFSPaymentFormProps> = ({ amount, provider, onPay, loading }) => {
  const cfg = PROVIDER_CONFIG[provider];
  const [step, setStep]       = useState<Step>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState('');
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const MOCK_OTP   = '123456';
  const MOCK_PHONE = /^01[3-9]\d{8}$/;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!MOCK_PHONE.test(phone.replace(/\s/g, ''))) {
      setError('Enter a valid 11-digit BD mobile number (e.g. 01XXXXXXXXX).');
      return;
    }
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp !== MOCK_OTP) {
      setError(`Incorrect OTP. Use the simulated code: ${MOCK_OTP}`);
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }
    setIsVerifying(true);
    setStep('verifying');
    await onPay();
  };

  const stepMeta = [
    { id: 'phone', label: 'Phone'  },
    { id: 'otp',   label: 'OTP'    },
    { id: 'pin',   label: 'PIN'    },
  ] as const;

  const currentStepIdx = step === 'verifying' ? 2
    : step === 'pin' ? 2
    : step === 'otp' ? 1
    : 0;

  return (
    <div className="space-y-6">
      {/* Provider Brand Header */}
      <div className="rounded-2xl p-5 text-white text-center" style={{ background: cfg.gradient }}>
        <p className="text-3xl mb-1">{cfg.logo}</p>
        <p className="font-black text-2xl tracking-tight">{cfg.name} Payment</p>
        <p className="text-white/70 text-sm mt-1">Secure Mobile Payment Simulation</p>
        <div className="mt-3 inline-block bg-white/20 backdrop-blur rounded-xl px-5 py-2">
          <p className="text-xs text-white/70 font-medium">Amount</p>
          <p className="text-2xl font-black">৳{amount.toLocaleString()}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-center gap-2">
        {stepMeta.map((s, i) => {
          const isDone    = i < currentStepIdx;
          const isActive  = i === currentStepIdx;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background:  isDone || isActive ? cfg.gradient : undefined,
                    backgroundColor: isDone || isActive ? undefined : '#f1f5f9',
                    color: isDone || isActive ? 'white' : '#94a3b8',
                  }}
                >
                  {isDone ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: isActive ? cfg.brandColor : isDone ? cfg.brandColor : '#cbd5e1' }}>
                  {s.label}
                </span>
              </div>
              {i < stepMeta.length - 1 && (
                <div className="h-0.5 w-12 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i < currentStepIdx ? cfg.brandColor : '#e2e8f0' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
          style={{ backgroundColor: '#fff0f0', color: '#c0392b', border: '1px solid #fca5a5' }}>
          <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Step 1 - Phone */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">
              <Phone size={11} className="inline mr-1" />Your {cfg.name} Number
            </label>
            <input
              type="tel" required inputMode="numeric"
              placeholder="e.g. 01XXXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none transition-colors"
              style={{ outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = cfg.brandColor)}
              onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              ✦ Simulation hint: any valid BD number (e.g. 01712345678) works.
            </p>
          </div>
          <button type="submit" className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: cfg.gradient }}>
            Send OTP
          </button>
        </form>
      )}

      {/* Step 2 - OTP */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: cfg.lightBg, color: cfg.textColor }}>
            <p className="font-semibold">OTP sent to <strong>{phone}</strong></p>
            <p className="text-xs opacity-70 mt-1">Simulated OTP: <strong>{MOCK_OTP}</strong> (auto-fill in demo)</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">
              <Hash size={11} className="inline mr-1" />Enter OTP
            </label>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  type="text" inputMode="numeric" maxLength={1}
                  value={otp[i] || ''}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = otp.split('');
                    newOtp[i] = val;
                    const joined = newOtp.join('').slice(0, 6);
                    setOtp(joined);
                    if (val && i < 5) {
                      const next = document.getElementById(`otp-${i + 1}`) as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  id={`otp-${i}`}
                  className="w-10 h-12 text-center text-lg font-bold border-2 rounded-xl transition-colors font-mono"
                  style={{ borderColor: otp[i] ? cfg.brandColor : '#e2e8f0' }}
                />
              ))}
            </div>
            <p className="text-center mt-2">
              <button type="button" className="text-xs font-bold underline" style={{ color: cfg.brandColor }}
                onClick={() => setOtp(MOCK_OTP)}>
                Auto-fill OTP (demo)
              </button>
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep('phone'); setError(null); setOtp(''); }}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-500 hover:border-slate-400 transition-colors">
              Back
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: cfg.gradient }}>
              Verify OTP
            </button>
          </div>
        </form>
      )}

      {/* Step 3 - PIN */}
      {step === 'pin' && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: cfg.lightBg, color: cfg.textColor }}>
            <p className="font-semibold">✓ OTP Verified</p>
            <p className="opacity-70 text-xs mt-0.5">Enter your {cfg.name} PIN to complete payment.</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">
              <Lock size={11} className="inline mr-1" />Enter PIN
            </label>
            <input
              type="password" inputMode="numeric" required maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-widest font-mono focus:outline-none transition-colors"
              onFocus={e => (e.target.style.borderColor = cfg.brandColor)}
              onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
            />
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              ✦ Simulation: any PIN (min 4 digits) will work.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep('otp'); setError(null); setPin(''); }}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-500 hover:border-slate-400 transition-colors"
              disabled={isVerifying}>
              Back
            </button>
            <button type="submit" disabled={loading || isVerifying}
              className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: cfg.gradient }}>
              {loading || isVerifying ? <><Loader size={15} className="animate-spin" /> Processing...</> : `Pay ৳${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      )}

      {/* Verifying overlay */}
      {step === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ background: cfg.gradient }}>
            <Loader size={28} className="text-white animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg" style={{ color: cfg.brandColor }}>Processing Payment…</p>
            <p className="text-slate-400 text-sm mt-1">Please wait while we verify your transaction.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MFSPaymentForm;

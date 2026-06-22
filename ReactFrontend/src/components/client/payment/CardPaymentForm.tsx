import React, { useState, useCallback } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

interface CardPaymentFormProps {
  amount: number;
  onPay: () => Promise<void>;
  loading: boolean;
}

// Simple luhn check for realistic feel
function luhn(value: string): boolean {
  const num = value.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw: string): string {
  const clean = raw.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
}

function detectNetwork(num: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

const NetworkLogo: React.FC<{ type: ReturnType<typeof detectNetwork> }> = ({ type }) => {
  if (type === 'visa') return (
    <span className="font-black italic text-white text-xl tracking-tight" style={{ fontFamily: 'serif', letterSpacing: '-1px' }}>
      VISA
    </span>
  );
  if (type === 'mastercard') return (
    <span className="flex items-center">
      <span className="w-6 h-6 rounded-full bg-red-500 opacity-80 -mr-3 inline-block" />
      <span className="w-6 h-6 rounded-full bg-yellow-400 opacity-80 inline-block" />
    </span>
  );
  return null;
};

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ amount, onPay, loading }) => {
  const [cardNumber, setCardNumber]   = useState('');
  const [cardName, setCardName]       = useState('');
  const [expiry, setExpiry]           = useState('');
  const [cvv, setCvv]                 = useState('');
  const [flipped, setFlipped]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const network = detectNetwork(cardNumber);
  const maskedNumber = cardNumber
    ? cardNumber.padEnd(19, '•').slice(0, 19)
    : '•••• •••• •••• ••••';
  const displayName   = cardName   || 'FULL NAME';
  const displayExpiry = expiry     || 'MM/YY';

  const validate = useCallback((): string | null => {
    const raw = cardNumber.replace(/\D/g, '');
    if (raw.length < 13) return 'Enter a valid card number.';
    if (!luhn(raw))       return 'Card number is invalid.';
    if (!cardName.trim()) return 'Cardholder name is required.';
    const parts = expiry.split('/');
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2)
      return 'Enter a valid expiry date (MM/YY).';
    const month = parseInt(parts[0], 10);
    const year  = parseInt(`20${parts[1]}`, 10);
    const now   = new Date();
    if (month < 1 || month > 12 || year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1))
      return 'Card is expired.';
    if (cvv.length < 3) return 'Enter a valid CVV.';
    return null;
  }, [cardNumber, cardName, expiry, cvv]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    await onPay();
  };

  return (
    <div className="space-y-6">
      {/* Live Credit Card Preview */}
      <div className="relative mx-auto" style={{ width: 320, height: 200, perspective: 800 }}>
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between shadow-2xl select-none overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #000269 0%, #0e2faa 60%, #1a47cc 100%)',
            }}
          >
            <div className="flex justify-between items-start">
              {/* Chip */}
              <div className="w-10 h-7 rounded-md bg-yellow-300/80" style={{ background: 'linear-gradient(135deg, #e0c060 30%, #f5e090 100%)' }}>
                <div className="w-full h-full rounded-md border border-yellow-500/40" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(180,140,0,0.3) 4px, rgba(180,140,0,0.3) 5px)'
                }} />
              </div>
              <NetworkLogo type={network} />
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold mb-1 uppercase tracking-widest">Card Number</p>
              <p className="text-white font-mono text-lg tracking-widest leading-tight">{maskedNumber}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Cardholder</p>
                <p className="text-white font-bold text-sm uppercase tracking-wide truncate max-w-[160px]">{displayName}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Expires</p>
                <p className="text-white font-bold text-sm font-mono">{displayExpiry}</p>
              </div>
            </div>
            {/* Shine overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col justify-center shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1a1a3a 0%, #0e2060 100%)',
            }}
          >
            {/* Magnetic strip */}
            <div className="w-full h-12 bg-slate-900/80 mt-4 mb-6" />
            <div className="px-5 flex items-center gap-3">
              <div className="flex-1 h-8 rounded bg-white/90 flex items-center px-3">
                <span className="flex-1" />
                <span className="font-mono font-bold text-slate-800 tracking-widest">{cvv.padEnd(3, '•').slice(0, 3)}</span>
              </div>
              <div className="text-right">
                <NetworkLogo type={network} />
                <p className="text-white/40 text-xs mt-1">CVV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}

        {/* Card Number */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Card Number</label>
          <input
            type="text" inputMode="numeric" required
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            onFocus={() => setFlipped(false)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Cardholder Name</label>
          <input
            type="text" required
            placeholder="e.g. John Doe"
            value={cardName}
            onChange={e => setCardName(e.target.value.toUpperCase())}
            onFocus={() => setFlipped(false)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">Expiry Date</label>
            <input
              type="text" inputMode="numeric" required
              placeholder="MM/YY"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              onFocus={() => setFlipped(false)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* CVV */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-400 block mb-1.5">CVV / CVC</label>
            <input
              type="text" inputMode="numeric" required
              placeholder="123"
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #000269 0%, #001a99 100%)', color: 'white' }}
        >
          <CreditCard size={18} />
          {loading ? 'Processing...' : `Pay ৳${amount.toLocaleString()}`}
        </button>
      </form>
    </div>
  );
};

export default CardPaymentForm;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Hotel, Calendar, Users, Compass } from 'lucide-react';

// Inline the asset path — Vite resolves this at build time.
// If the file doesn't exist yet, the CSS gradient overlay still makes the section look great.
const heroBg = '/src/assets/hero_bg.png';

type Tab = 'tour' | 'hotel';

const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab]     = useState<Tab>('tour');
  const [tourQuery, setTourQuery]     = useState('');
  const [hotelCity, setHotelCity]     = useState('');
  const [checkIn, setCheckIn]         = useState('');
  const [checkOut, setCheckOut]       = useState('');
  const [guests, setGuests]           = useState(1);
  const navigate = useNavigate();

  const handleTourSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tours${tourQuery ? `?q=${encodeURIComponent(tourQuery)}` : ''}`);
  };

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (hotelCity) params.set('search', hotelCity);
    if (checkIn)   params.set('checkin', checkIn);
    if (checkOut)  params.set('checkout', checkOut);
    params.set('rooms', `1,${guests},0`);
    navigate(`/hotels?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #000269 0%, #001a99 40%, #003366 100%)' }}>

      {/* ── Background image (sits on top of gradient fallback) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,2,105,0.60) 0%, rgba(0,2,105,0.30) 50%, rgba(0,0,0,0.55) 100%)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">

        {/* Tagline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-semibold"
            style={{ backgroundColor: 'rgba(249,208,48,0.2)', color: 'var(--brand-yellow)', border: '1px solid rgba(249,208,48,0.4)' }}>
            <Compass size={15} />
            Discover Bangladesh's Hidden Gems
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            Your Journey Begins<br />
            <span style={{ color: 'var(--brand-yellow)' }}>Here</span>
          </h1>
          <p className="text-slate-200 text-lg max-w-xl mx-auto leading-relaxed">
            Explore breathtaking destinations, book dream hotels, and create memories that last a lifetime.
          </p>
        </div>

        {/* ── Search Widget ── */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('tour')}
              className={`search-tab flex-1 ${activeTab === 'tour' ? 'active' : ''}`}
            >
              <MapPin size={16} style={{ color: activeTab === 'tour' ? 'var(--brand-yellow)' : undefined }} />
              Tour Packages
            </button>
            <button
              onClick={() => setActiveTab('hotel')}
              className={`search-tab flex-1 ${activeTab === 'hotel' ? 'active' : ''}`}
            >
              <Hotel size={16} style={{ color: activeTab === 'hotel' ? 'var(--brand-yellow)' : undefined }} />
              Hotels
            </button>
          </div>

          {/* ── Tour Tab ── */}
          {activeTab === 'tour' && (
            <form onSubmit={handleTourSearch} className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl focus-within:border-yellow-400 transition-colors">
                  <MapPin size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: 'var(--text-muted)' }}>
                      Location / Tour Name
                    </label>
                    <input
                      type="text"
                      value={tourQuery}
                      onChange={e => setTourQuery(e.target.value)}
                      placeholder="Cox's Bazar, Sylhet, Sundarbans..."
                      className="input-client text-sm font-medium w-full"
                      style={{ color: 'var(--brand-navy)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-brand px-8 py-3.5 text-base rounded-xl font-bold whitespace-nowrap"
                >
                  <Search size={18} />
                  Search Tours
                </button>
              </div>
            </form>
          )}

          {/* ── Hotel Tab ── */}
          {activeTab === 'hotel' && (
            <form onSubmit={handleHotelSearch} className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                {/* City */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl focus-within:border-yellow-400 transition-colors">
                  <Hotel size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: 'var(--text-muted)' }}>
                      City / Hotel / Area
                    </label>
                    <input
                      type="text"
                      value={hotelCity}
                      onChange={e => setHotelCity(e.target.value)}
                      placeholder="Cox's Bazar, Dhaka, Sylhet..."
                      className="input-client text-sm font-medium w-full"
                      style={{ color: 'var(--brand-navy)' }}
                    />
                  </div>
                </div>

                {/* Check-in */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl focus-within:border-yellow-400 transition-colors min-w-[155px]">
                  <Calendar size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: 'var(--text-muted)' }}>
                      Check In
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={e => setCheckIn(e.target.value)}
                      className="input-client text-sm font-medium"
                      style={{ color: 'var(--brand-navy)' }}
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl focus-within:border-yellow-400 transition-colors min-w-[155px]">
                  <Calendar size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: 'var(--text-muted)' }}>
                      Check Out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || today}
                      onChange={e => setCheckOut(e.target.value)}
                      className="input-client text-sm font-medium"
                      style={{ color: 'var(--brand-navy)' }}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-slate-200 rounded-xl focus-within:border-yellow-400 transition-colors min-w-[130px]">
                  <Users size={18} style={{ color: 'var(--brand-navy)', flexShrink: 0 }} />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: 'var(--text-muted)' }}>
                      Guests
                    </label>
                    <input
                      type="number"
                      value={guests}
                      min={1}
                      max={20}
                      onChange={e => setGuests(Number(e.target.value))}
                      className="input-client text-sm font-medium w-14"
                      style={{ color: 'var(--brand-navy)' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-brand w-full py-3.5 text-base rounded-xl font-bold"
              >
                <Search size={18} />
                Search Hotels
              </button>
            </form>
          )}
        </div>

        {/* ── Custom Tour CTA ── */}
        <div className="mt-5 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl"
          style={{ backgroundColor: 'rgba(0,2,105,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span className="text-white text-sm font-medium">Need a Customized Tour?</span>
          <Link to="/request-custom-tour"
            className="px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
            Request Now
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/30 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;

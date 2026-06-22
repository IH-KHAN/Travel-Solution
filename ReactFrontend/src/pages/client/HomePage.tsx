import React from 'react';
import HeroSection         from '@/components/client/home/HeroSection';
import FeaturedPackages    from '@/components/client/home/FeaturedPackages';
import FeaturedHotels      from '@/components/client/home/FeaturedHotels';
import DestinationsSection from '@/components/client/home/DestinationsSection';

/* ── "Why choose us" stats strip ──────────────────────────────── */
const StatsStrip: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Tour Packages' },
    { value: '200+', label: 'Hotels Listed' },
    { value: '50K+', label: 'Happy Travellers' },
    { value: '64',   label: 'Destinations' },
  ];
  return (
    <section className="py-10" style={{ backgroundColor: 'var(--brand-navy)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold" style={{ color: 'var(--brand-yellow)' }}>{value}</p>
              <p className="text-white/70 text-sm mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── CTA banner ──────────────────────────────────────────────── */
const CtaBanner: React.FC = () => (
  <section className="py-20" style={{ backgroundColor: 'var(--brand-navy)' }}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        Ready for Your Next Adventure?
      </h2>
      <p className="text-slate-300 text-base mb-8 leading-relaxed">
        Join thousands of happy travellers who've discovered Bangladesh's most beautiful destinations with us.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/tours"
          className="btn-brand px-8 py-3.5 text-base rounded-xl font-bold inline-flex items-center justify-center gap-2"
        >
          Browse Tour Packages
        </a>
        <a
          href="/register"
          className="px-8 py-3.5 text-base rounded-xl font-bold inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
        >
          Create Free Account
        </a>
      </div>
    </div>
  </section>
);

/* ── Home Page ───────────────────────────────────────────────── */
const HomePage: React.FC = () => (
  <>
    <HeroSection />
    <StatsStrip />
    <FeaturedPackages />
    <FeaturedHotels />
    <DestinationsSection />
    <CtaBanner />
  </>
);

export default HomePage;

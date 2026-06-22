import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Clock, Users, MapPin,
  ArrowRight, X, ChevronDown, ChevronUp, ImageOff, AlertCircle
} from 'lucide-react';
import { usePackages, type PackageMasterDTO } from '@/hooks/usePackages';
import { SkeletonCards } from '@/components/client/ui/SkeletonCard';

import { TourCard } from '@/components/client/cards/TourCard';

// ── Duration buckets ──────────────────────────────────────────────
const DURATION_BUCKETS = [
  { label: 'Any', min: 0, max: Infinity },
  { label: '1–3 Days', min: 1, max: 3 },
  { label: '4–7 Days', min: 4, max: 7 },
  { label: '8–14 Days', min: 8, max: 14 },
  { label: '15+ Days', min: 15, max: Infinity },
];

// ── Price buckets ─────────────────────────────────────────────────
const PRICE_BUCKETS = [
  { label: 'Any', min: 0, max: Infinity },
  { label: 'Under ৳5,000', min: 0, max: 5000 },
  { label: '৳5,000–10,000', min: 5000, max: 10000 },
  { label: '৳10,000–20,000', min: 10000, max: 20000 },
  { label: '৳20,000+', min: 20000, max: Infinity },
];

// ── Filter sidebar ────────────────────────────────────────────────
interface FilterPanelProps {
  search: string; setSearch: (v: string) => void;
  durationIdx: number; setDurationIdx: (i: number) => void;
  priceIdx: number; setPriceIdx: (i: number) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  search, setSearch, durationIdx, setDurationIdx, priceIdx, setPriceIdx, onReset
}) => {
  const [durOpen, setDurOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: 'var(--brand-navy)' }}>
            <SlidersHorizontal size={16} className="inline mr-2" />Filters
          </h3>
          <button onClick={onReset}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> Reset
          </button>
        </div>

        {/* Keyword */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Package name..."
              className="w-full pl-9 pr-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors"
              style={{ color: 'var(--brand-navy)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <button
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wide text-slate-400 mb-2"
            onClick={() => setDurOpen(p => !p)}>
            Duration {durOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {durOpen && (
            <div className="space-y-1.5">
              {DURATION_BUCKETS.map((b, i) => (
                <button key={i} onClick={() => setDurationIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${durationIdx === i
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-50'}`}
                  style={durationIdx === i ? { backgroundColor: 'var(--brand-navy)' } : {}}>
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <button
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wide text-slate-400 mb-2"
            onClick={() => setPriceOpen(p => !p)}>
            Price Range {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {priceOpen && (
            <div className="space-y-1.5">
              {PRICE_BUCKETS.map((b, i) => (
                <button key={i} onClick={() => setPriceIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${priceIdx === i
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-50'}`}
                  style={priceIdx === i ? { backgroundColor: 'var(--brand-navy)' } : {}}>
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// ── Main page ─────────────────────────────────────────────────────
const ToursListPage: React.FC = () => {
  const { packages, loading, error } = usePackages();
  const [searchParams]  = useSearchParams();
  const [search, setSearch]         = useState(searchParams.get('q') ?? '');
  const [durationIdx, setDurationIdx] = useState(0);
  const [priceIdx, setPriceIdx]       = useState(0);
  const [mobileFilter, setMobileFilter] = useState(false);
  const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc' | 'duration'>('default');

  const filtered = useMemo(() => {
    const dur   = DURATION_BUCKETS[durationIdx];
    const price = PRICE_BUCKETS[priceIdx];
    let list = packages.filter(p => {
      const finalPrice = p.packagePrice - p.discount + p.markUpAmount;
      const matchSearch = !search ||
        p.packageTitle?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchDur   = p.durationDays >= dur.min && p.durationDays <= dur.max;
      const matchPrice = finalPrice >= price.min && finalPrice <= price.max;
      return matchSearch && matchDur && matchPrice;
    });

    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.packagePrice - b.packagePrice);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.packagePrice - a.packagePrice);
    if (sort === 'duration')   list = [...list].sort((a, b) => a.durationDays - b.durationDays);
    return list;
  }, [packages, search, durationIdx, priceIdx, sort]);

  const resetFilters = () => { setSearch(''); setDurationIdx(0); setPriceIdx(0); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* ── Page header ── */}
      <div className="pt-20 pb-10" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">Explore Bangladesh</p>
          <h1 className="text-4xl font-bold text-white mb-3">Tour Packages</h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Discover handpicked adventures across Bangladesh's most stunning destinations
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${filtered.length} package${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold"
              style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}
              onClick={() => setMobileFilter(p => !p)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            {/* Sort */}
            <select
              value={sort} onChange={e => setSort(e.target.value as typeof sort)}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-yellow-400 bg-white"
              style={{ color: 'var(--brand-navy)' }}>
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop always visible, mobile conditionally */}
          <div className={`${mobileFilter ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel
              search={search} setSearch={setSearch}
              durationIdx={durationIdx} setDurationIdx={setDurationIdx}
              priceIdx={priceIdx} setPriceIdx={setPriceIdx}
              onReset={resetFilters}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <SkeletonCards count={6} />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(pkg => <TourCard key={pkg.packageId} pkg={pkg} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>No packages found</h3>
                <p className="text-sm text-slate-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToursListPage;

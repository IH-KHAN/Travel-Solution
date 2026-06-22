import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Utensils, AlertCircle } from 'lucide-react';
import { useRestaurants, type RestaurantMasterDTO } from '@/hooks/useRestaurants';
import { SkeletonCards } from '@/components/client/ui/SkeletonCard';

// ── Restaurant Card ───────────────────────────────────────────────
const RestaurantCard: React.FC<{ restaurant: RestaurantMasterDTO }> = ({ restaurant }) => {
  const totalItems = restaurant.breakfasts.length + restaurant.lunches.length + restaurant.dinners.length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${restaurant.isOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            {restaurant.isOpen ? 'Open Now' : 'Closed'}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Utensils size={14} />
          </div>
        </div>

        <h3 className="font-bold text-lg leading-snug mb-1 line-clamp-1" style={{ color: 'var(--brand-navy)' }}>
          {restaurant.restaurantName ?? 'Unnamed Restaurant'}
        </h3>
        
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
          <MapPin size={14} className="text-yellow-500 shrink-0" />
          <span className="line-clamp-1">{restaurant.location || 'Location not specified'}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500 mb-5">
          {restaurant.breakfasts.length > 0 && <span className="bg-slate-100 px-2 py-1 rounded-md">Breakfast</span>}
          {restaurant.lunches.length > 0 && <span className="bg-slate-100 px-2 py-1 rounded-md">Lunch</span>}
          {restaurant.dinners.length > 0 && <span className="bg-slate-100 px-2 py-1 rounded-md">Dinner</span>}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-400">
            {totalItems} Menu Items
          </p>
          <Link to={`/restaurants/${restaurant.restaurantId}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
            View Menu <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const RestaurantsListPage: React.FC = () => {
  const { restaurants, loading, error } = useRestaurants();
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState<'All' | 'Open' | 'Closed'>('All');

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      const matchSearch = !search ||
        r.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
        r.location?.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = filterOpen === 'All' ||
        (filterOpen === 'Open' && r.isOpen) ||
        (filterOpen === 'Closed' && !r.isOpen);

      return matchSearch && matchStatus;
    });
  }, [restaurants, search, filterOpen]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* Header */}
      <div className="pt-20 pb-10" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">Taste of Bangladesh</p>
          <h1 className="text-4xl font-bold text-white mb-3">Dining & Restaurants</h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Discover exquisite local and international cuisines.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search restaurants or locations..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400"
              style={{ color: 'var(--brand-navy)' }}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
            {(['All', 'Open', 'Closed'] as const).map(f => (
              <button key={f} onClick={() => setFilterOpen(f)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all
                  ${filterOpen === f ? 'shadow-sm text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                style={filterOpen === f ? { backgroundColor: 'var(--brand-navy)' } : {}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <SkeletonCards count={8} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(r => <RestaurantCard key={r.restaurantId} restaurant={r} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>No restaurants found</h3>
            <p className="text-sm text-slate-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsListPage;

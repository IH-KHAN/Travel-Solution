import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ChevronLeft, AlertCircle, Loader, UtensilsCrossed, Clock, Coffee, Sun, Moon } from 'lucide-react';
import { useRestaurantById, type BreakfastDetailDTO, type LunchDetailDTO, type DinnerDetailDTO } from '@/hooks/useRestaurants';

// ── Item Card ─────────────────────────────────────────────────────
const MenuItemCard: React.FC<{ item: BreakfastDetailDTO | LunchDetailDTO | DinnerDetailDTO, type: 'breakfast' | 'lunch' | 'dinner' }> = ({ item, type }) => {
  let timeStr = '';
  if (type === 'breakfast') timeStr = (item as BreakfastDetailDTO).breakfastTime;
  else if (type === 'lunch') timeStr = (item as LunchDetailDTO).lunchTime;
  else if (type === 'dinner') timeStr = (item as DinnerDetailDTO).dinnerTime;

  const time = timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
      <div>
        <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-navy)' }}>
          {item.menuItem}
        </h4>
        {time && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock size={12} /> Available around {time}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span className="text-sm font-semibold text-slate-400 block mb-0.5">Price</span>
        <span className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
          ৳{item.itemPrice.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// ── Detail Page ───────────────────────────────────────────────────
const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { restaurant, loading, error } = useRestaurantById(id ? Number(id) : null);

  const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader size={36} className="animate-spin" style={{ color: 'var(--brand-navy)' }} />
    </div>
  );

  if (error || !restaurant) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 pt-20">
      <AlertCircle size={48} className="text-red-400" />
      <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-navy)' }}>Restaurant Not Found</h2>
      <p className="text-slate-400 text-sm">{error}</p>
      <Link to="/restaurants" className="btn-brand px-6 py-3 rounded-xl text-sm font-bold mt-2">
        Back to Restaurants
      </Link>
    </div>
  );

  const TABS = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, count: restaurant.breakfasts.length },
    { id: 'lunch', label: 'Lunch', icon: Sun, count: restaurant.lunches.length },
    { id: 'dinner', label: 'Dinner', icon: Moon, count: restaurant.dinners.length },
  ] as const;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* ── Hero ── */}
      <div className="relative pt-24 pb-12 sm:pt-32 sm:pb-16" style={{ background: 'linear-gradient(135deg,#000269 0%,#001a99 100%)' }}>
        <div className="absolute top-20 left-0 right-0 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/restaurants" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors w-fit">
              <ChevronLeft size={16} /> All Restaurants
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            {restaurant.restaurantName}
          </h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin size={16} className="text-yellow-400" />
            {restaurant.location}
          </div>
        </div>
      </div>

      {/* ── Menu Section ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-8">
          
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-2 gap-2 overflow-x-auto hide-scrollbar">
            {TABS.map(({ id, label, icon: Icon, count }) => (
              <button key={id} onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold text-sm transition-all duration-200 border-b-2 -mb-[2px] whitespace-nowrap
                  ${activeTab === id ? 'border-yellow-400 text-navy-900 bg-slate-50' : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'}`}
                style={activeTab === id ? { color: 'var(--brand-navy)' } : {}}>
                <Icon size={16} /> {label} ({count})
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'breakfast' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {restaurant.breakfasts.length === 0 ? (
                  <div className="text-center py-16 text-slate-400"><UtensilsCrossed size={36} className="mx-auto mb-3 opacity-30"/> <p>No breakfast items available.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.breakfasts.map(b => <MenuItemCard key={b.menuId} item={b} type="breakfast" />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lunch' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {restaurant.lunches.length === 0 ? (
                  <div className="text-center py-16 text-slate-400"><UtensilsCrossed size={36} className="mx-auto mb-3 opacity-30"/> <p>No lunch items available.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.lunches.map(l => <MenuItemCard key={l.menuId} item={l} type="lunch" />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dinner' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {restaurant.dinners.length === 0 ? (
                  <div className="text-center py-16 text-slate-400"><UtensilsCrossed size={36} className="mx-auto mb-3 opacity-30"/> <p>No dinner items available.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.dinners.map(d => <MenuItemCard key={d.menuId} item={d} type="dinner" />)}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default RestaurantDetailPage;

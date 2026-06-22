import React from 'react';
import { Package, Hotel, UtensilsCrossed, MapPin, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.FC<{ size?: number; className?: string }>;
  color: string; to: string;
}> = ({ label, value, icon: Icon, color, to }) => (
  <Link to={to} className="card hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName} 👋</h1>
        <p className="text-slate-500 mt-1">Here's your travel platform overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Tour Packages" value="—"  icon={Package}         color="bg-indigo-500"  to="/packages" />
        <StatCard label="Hotels"         value="—"  icon={Hotel}           color="bg-violet-500"  to="/hotels" />
        <StatCard label="Geographies"    value="—"  icon={MapPin}          color="bg-emerald-500" to="/geographies" />
        <StatCard label="Users"          value="—"  icon={Users}           color="bg-blue-500"    to="/users" />
        <StatCard label="Total Revenue"  value="—"  icon={TrendingUp}      color="bg-rose-500"    to="/bookings" />
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Recent Bookings</h2>
          <p className="text-sm text-slate-400 text-center py-8">Connect the API to display real data.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Activity Feed</h2>
          <p className="text-sm text-slate-400 text-center py-8">Real-time events will appear here via Socket.IO.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

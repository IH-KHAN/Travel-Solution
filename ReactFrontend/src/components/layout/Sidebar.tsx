import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Hotel, UtensilsCrossed,
  Users, MapPin, LogOut, Globe
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/packages',     icon: Package,          label: 'Tour Packages' },
  { to: '/hotels',       icon: Hotel,            label: 'Hotels' },
  { to: '/geographies',  icon: MapPin,           label: 'Geographies' },
  { to: '/users',        icon: Users,            label: 'Users' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';
  const userRole = localStorage.getItem('role') || '';

  const handleLogout = () => {
    ['token', 'userId', 'role', 'userName'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-content-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Travel Solution</p>
            <p className="text-slate-400 text-xs mt-0.5">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-content-center text-white font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-slate-400 text-xs">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors text-sm"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin, Mail, Phone, Share2, Heart, Rss } from 'lucide-react';

const Footer: React.FC = () => {
  const navLinks = [
    { to: '/tours',        label: 'Tour Packages' },
    { to: '/hotels',       label: 'Hotels' },
    { to: '/restaurants',  label: 'Restaurants' },
    { to: '/destinations', label: 'Destinations' },
  ];

  const accountLinks = [
    { to: '/login',       label: 'Sign In' },
    { to: '/register',    label: 'Register' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/profile',     label: 'My Profile' },
  ];

  return (
    <footer style={{ backgroundColor: 'var(--brand-navy)' }} className="text-white">
      {/* ── Main footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--brand-yellow)' }}>
                <Globe size={20} style={{ color: 'var(--brand-navy)' }} />
              </div>
              Travel Solution
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              Your gateway to Bangladesh's finest destinations. Discover breathtaking tours,
              comfortable hotels, and unforgettable experiences.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[Share2, Heart, Rss].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:border-white transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Explore */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Explore</h4>
            <ul className="space-y-3">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-300 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 group-hover:w-2 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Account */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">My Account</h4>
            <ul className="space-y-3">
              {accountLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-300 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-yellow-400 group-hover:w-2 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-300 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0 text-yellow-400" />
                Dhaka, Bangladesh
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Phone size={15} className="shrink-0 text-yellow-400" />
                +880 1XXXXXXXXX
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail size={15} className="shrink-0 text-yellow-400" />
                info@travelsolution.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Travel Solution. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

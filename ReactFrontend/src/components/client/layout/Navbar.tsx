import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Globe, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { to: '/tours',        label: 'Tours' },
  { to: '/hotels',       label: 'Hotels' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/request-custom-tour', label: 'Custom Tours' },
];

const ClientNavbar: React.FC = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const navigate = useNavigate();

  const token    = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  /* ── Scroll behaviour ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => { setMenuOpen(false); }, []);

  const handleLogout = () => {
    ['token', 'userId', 'role', 'userName'].forEach(k => localStorage.removeItem(k));
    setDropOpen(false);
    navigate('/login');
  };

  const navbarBg = scrolled
    ? 'bg-white shadow-md'
    : 'bg-transparent';

  const textColor = scrolled ? 'text-slate-800' : 'text-white';
  const logoColor = scrolled ? '' : 'text-white';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className={`flex items-center gap-2 font-bold text-xl ${logoColor}`}
          style={scrolled ? { color: 'var(--brand-navy)' } : {}}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-yellow)' }}>
            <Globe size={18} style={{ color: 'var(--brand-navy)' }} />
          </div>
          Travel Solution
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                 ${isActive
                    ? 'text-yellow-400 bg-white/10'
                    : `${textColor} hover:bg-white/10`}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="hidden md:flex items-center gap-3">
          {token && userName ? (
            /* Logged-in user dropdown */
            <div className="relative">
              <button
                onClick={() => setDropOpen(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${textColor} hover:bg-white/10`}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                {userName}
                <ChevronDown size={14} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
                    style={{ color: 'var(--brand-navy)' }}
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
                    style={{ color: 'var(--brand-navy)' }}
                  >
                    <User size={15} className="opacity-0" /> {/* Spacer or use Calendar if imported, but User is already imported. Wait, I should import Calendar or use a standard icon. I'll just use a generic style. */}
                    <span className="flex items-center gap-2 -ml-6"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg> My Bookings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest buttons */
            <>
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${textColor} hover:bg-white/10`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200"
                style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile menu toggle ── */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${textColor} hover:bg-white/10`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                   ${isActive
                      ? 'text-white'
                      : 'text-slate-700 hover:bg-slate-50'}`
                }
                style={({ isActive }) => isActive ? { backgroundColor: 'var(--brand-navy)' } : {}}
              >
                {label}
              </NavLink>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-center rounded-xl border-2 transition-colors"
                    style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}>
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 text-sm font-bold text-center rounded-xl"
                    style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default ClientNavbar;

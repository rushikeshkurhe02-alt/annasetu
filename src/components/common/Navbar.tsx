import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../utils/constants';
import {
  UtensilsCrossed,
  Building2,
  HeartHandshake,
  Menu,
  X,
  LogOut,
  User,
  PlusCircle,
  Radio,
  Globe,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { to: '/providers', label: t('foodProviders'), icon: Building2 },
    { to: '/places', label: t('placesInNeed'), icon: HeartHandshake },
    { to: '/ngos', label: t('ngos'), icon: UtensilsCrossed }
  ];

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E8E2D2] transition-colors">
      {/* Top micro banner for Ideathon */}
      <div className="bg-[#1F6B3A] text-emerald-50 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>NEUROVERSE Open Innovation Track • Team <strong>Code Ninjas</strong> Prototype</span>
        <span className="hidden md:inline text-emerald-200">| Surplus Food Relationship & Transparency Protocol</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F6B3A] to-[#154d29] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="text-xl font-black tracking-tighter">अ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl text-gray-900 tracking-tight flex items-center gap-1">
                AnnaSetu
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  Demo
                </span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">
                Bridge of Surplus Food & Trust
              </span>
            </div>
          </Link>

          {/* Desktop Public Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-[#1F6B3A] text-white shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-[#EFE8DA]'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language, Post/Live buttons, Auth */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#EFE8DA] p-0.5 rounded-lg border border-[#DDD3C0]">
              <Globe className="w-3.5 h-3.5 text-gray-500 ml-1.5 mr-0.5" />
              {(['en', 'hi', 'mr'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-all ${
                    language === lang
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Quick Live Offers Feed Button */}
            <Link
              to="/ngo-dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300/70 transition-all shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Live Offers</span>
            </Link>

            {/* Role-based Dashboard or Auth */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-gray-300">
                <Link
                  to={user.role === 'provider' ? '/provider-dashboard' : '/ngo-dashboard'}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#1F6B3A] hover:bg-[#164e29] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    {user.role === 'provider' ? 'Provider Dashboard' : 'NGO Dashboard'}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1 border-l border-gray-300">
                <Link
                  to="/auth"
                  className="px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 rounded-xl transition-colors border border-emerald-300/70"
                >
                  Sign In / Sign Up
                </Link>
                <Link
                  to="/provider-dashboard"
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-[#1F6B3A] hover:bg-[#164e29] rounded-xl shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Surplus</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/auth"
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 rounded-lg"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D2] bg-[#FAF8F3] px-4 pt-3 pb-6 space-y-3">
          <div className="flex justify-between items-center py-1 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500">Language:</span>
            <div className="flex gap-1">
              {(['en', 'hi', 'mr'] as SupportedLanguage[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    language === lang ? 'bg-[#1F6B3A] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                isActive('/') ? 'bg-[#1F6B3A] text-white' : 'text-gray-800 hover:bg-[#EFE8DA]'
              }`}
            >
              Home
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  isActive(link.to) ? 'bg-[#1F6B3A] text-white' : 'text-gray-800 hover:bg-[#EFE8DA]'
                }`}
              >
                <link.icon className="w-4 h-4 opacity-75" />
                {link.label}
              </Link>
            ))}
            <Link
              to="/ngo-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-amber-900 bg-amber-100 flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-amber-600" />
              Live Surplus Offers Feed
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-200">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  to={user.role === 'provider' ? '/provider-dashboard' : '/ngo-dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-[#1F6B3A] text-white font-bold rounded-xl text-center block text-sm"
                >
                  Go to {user.role === 'provider' ? 'Provider Dashboard' : 'NGO Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full py-2 text-center text-xs text-red-600 font-semibold"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-xs bg-gray-200 text-gray-800 rounded-xl"
                >
                  Sign In / Sign Up
                </Link>
                <Link
                  to="/provider-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-xs bg-[#1F6B3A] text-white rounded-xl"
                >
                  Post Surplus
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

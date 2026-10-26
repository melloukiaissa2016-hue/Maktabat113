import React, { useState } from 'react';
import {
  Printer,
  ShoppingBag,
  FileText,
  Briefcase,
  BookOpen,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  Globe,
  FileCheck2,
  Phone,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SiteSettings } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  siteSettings: SiteSettings;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  siteSettings,
  onOpenAuth
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome'), icon: Sparkles },
    { id: 'store', label: t('navStore'), icon: ShoppingBag },
    { id: 'print', label: t('navPrint'), icon: Printer },
    { id: 'research', label: t('navResearch'), icon: FileText },
    { id: 'documents', label: t('navDocuments'), icon: FileCheck2 },
    { id: 'jobs', label: t('navJobs'), icon: Briefcase },
    { id: 'lessons', label: t('navLessons'), icon: BookOpen },
    { id: 'track', label: t('navTrack'), icon: Search },
    { id: 'contact', label: t('navContact'), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar for quick contacts & announcements */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>📞 {siteSettings.phone}</span>
            <span>💬 واتساب: {siteSettings.phoneWhatsApp}</span>
            <span className="truncate">📍 {siteSettings.address}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-300 font-medium">✨ {siteSettings.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo / Brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            {siteSettings.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.siteName}
                className="w-11 h-11 object-contain rounded-xl shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <Printer className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  {siteSettings.siteName}
                </span>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                  113
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-none">
                {language === 'ar' ? siteSettings.siteNameAr : siteSettings.siteName}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Cart, Language, Auth, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors"
              title={t('navCart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="uppercase">{language}</span>
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute end-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-sm"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  <button
                    onClick={() => { setLanguage('ar'); setLangMenuOpen(false); }}
                    className={`w-full text-start px-3 py-2 text-xs font-bold hover:bg-emerald-50 flex items-center justify-between ${language === 'ar' ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-700'}`}
                  >
                    <span>العربية</span>
                    {language === 'ar' && '✓'}
                  </button>
                  <button
                    onClick={() => { setLanguage('fr'); setLangMenuOpen(false); }}
                    className={`w-full text-start px-3 py-2 text-xs font-bold hover:bg-emerald-50 flex items-center justify-between ${language === 'fr' ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-700'}`}
                  >
                    <span>Français</span>
                    {language === 'fr' && '✓'}
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                    className={`w-full text-start px-3 py-2 text-xs font-bold hover:bg-emerald-50 flex items-center justify-between ${language === 'en' ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-700'}`}
                  >
                    <span>English</span>
                    {language === 'en' && '✓'}
                  </button>
                </div>
              )}
            </div>


            {/* Auth / Account Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : 'U')}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden md:inline truncate max-w-[100px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute end-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 truncate">{currentUser.displayName || 'مستخدم'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { onNavigate('account'); setUserMenuOpen(false); }}
                      className="w-full text-start px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t('navAccount')}</span>
                    </button>

                    <button
                      onClick={async () => { await logout(); setUserMenuOpen(false); }}
                      className="w-full text-start px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t('navLogin')}</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-600" />
                <span>{item.label}</span>
              </button>
            );
          })}


        </div>
      )}
    </header>
  );
};

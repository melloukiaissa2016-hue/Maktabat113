import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { NovemberBanner } from './components/NovemberBanner';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { PrintOrderView } from './views/PrintOrderView';
import { ResearchOrderView } from './views/ResearchOrderView';
import { DocumentsServiceView } from './views/DocumentsServiceView';
import { JobOffersView } from './views/JobOffersView';
import { LessonsBankView } from './views/LessonsBankView';
import { FlexyServiceView } from './views/FlexyServiceView';
import { BillPaymentServiceView } from './views/BillPaymentServiceView';
import { CartView } from './views/CartView';
import { TrackOrderView } from './views/TrackOrderView';
import { CustomerAccountView } from './views/CustomerAccountView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminLoginView } from './views/AdminLoginView';
import { PoliciesView } from './views/PoliciesView';
import { ContactView } from './views/ContactView';

import {
  getSiteSettings,
  seedInitialDataIfNeeded,
  subscribeProducts,
  subscribeJobOffers,
  subscribeLessons,
  DEFAULT_SITE_SETTINGS
} from './services/dbService';
import { Product, JobOffer, Lesson, SiteSettings } from './types';

const VALID_CUSTOMER_ROUTES = [
  'store',
  'print',
  'research',
  'documents',
  'flexy',
  'bills',
  'jobs',
  'lessons',
  'cart',
  'track',
  'account',
  'contact',
  'policies'
];

function parseCurrentRoute(): string {
  // 1. Check Hash first (supports e.g. #/admin/login, #admin/login, #admin, #store)
  if (typeof window !== 'undefined' && window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
    if (rawHash === 'admin/login' || rawHash === 'admin-login') return 'admin-login';
    if (rawHash === 'admin') return 'admin';
    if (VALID_CUSTOMER_ROUTES.includes(rawHash)) {
      return rawHash;
    }
  }

  // 2. Check Query Params (supports ?view=admin, ?admin=1, ?admin_login=1)
  if (typeof window !== 'undefined' && window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    if (viewParam === 'admin-login' || viewParam === 'admin/login') return 'admin-login';
    if (viewParam === 'admin') return 'admin';
    if (viewParam && VALID_CUSTOMER_ROUTES.includes(viewParam)) {
      return viewParam;
    }
    if (searchParams.has('admin_login') || searchParams.has('admin-login')) return 'admin-login';
    if (searchParams.has('admin')) return 'admin';
  }

  // 3. Check Standard Pathname
  if (typeof window !== 'undefined') {
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (cleanPath === 'admin/login' || cleanPath === 'admin-login') return 'admin-login';
    if (cleanPath === 'admin') return 'admin';
    if (VALID_CUSTOMER_ROUTES.includes(cleanPath)) {
      return cleanPath;
    }
  }

  return 'home';
}

function getPathFromView(view: string): string {
  if (view === 'admin-login') return '/admin/login';
  if (view === 'admin') return '/admin';
  if (view === 'home') return '/';
  return `/${view}`;
}

const MainLayout: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => parseCurrentRoute());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    // 1. Initial seed check
    seedInitialDataIfNeeded().catch(console.error);

    // 2. Fetch site settings
    getSiteSettings().then(setSiteSettings).catch(console.error);

    // 3. Subscriptions for live updates
    const unsubProducts = subscribeProducts(setProducts);
    const unsubJobs = subscribeJobOffers(setJobs);
    const unsubLessons = subscribeLessons(setLessons);

    // 4. Browser history listeners (both path and hash changes)
    const handleLocationChange = () => {
      setCurrentView(parseCurrentRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      unsubProducts();
      unsubJobs();
      unsubLessons();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    const targetPath = getPathFromView(view);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    // Also sync hash for universal static hosting / iframe support
    if (view === 'admin-login') {
      window.location.hash = '/admin/login';
    } else if (view === 'admin') {
      window.location.hash = '/admin';
    } else if (view === 'home') {
      if (window.location.hash) window.location.hash = '';
    } else {
      window.location.hash = `/${view}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshSettings = () => {
    getSiteSettings().then(setSiteSettings);
  };

  const isAdminRoute = currentView === 'admin' || currentView === 'admin-login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Cairo',sans-serif] w-full max-w-full overflow-x-hidden">
      {/* 1st November Commemorative Marquee Banner */}
      {siteSettings.novemberBannerEnabled !== false && currentView !== 'admin-login' && (
        <NovemberBanner />
      )}

      {/* Customer Navbar is hidden during dedicated Admin Login page */}
      {currentView !== 'admin-login' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          siteSettings={siteSettings}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {/* Main View Container */}
      <main className="flex-1">
        {/* PUBLIC VIEWS */}
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            featuredProducts={products}
            recentJobs={jobs}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'store' && (
          <ShopView
            products={products}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'print' && (
          <PrintOrderView
            onNavigate={handleNavigate}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'research' && (
          <ResearchOrderView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'documents' && (
          <DocumentsServiceView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'flexy' && (
          <FlexyServiceView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'bills' && (
          <BillPaymentServiceView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'jobs' && (
          <JobOffersView
            jobs={jobs}
          />
        )}

        {currentView === 'lessons' && (
          <LessonsBankView
            lessons={lessons}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            onNavigate={handleNavigate}
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'track' && (
          <TrackOrderView />
        )}

        {currentView === 'account' && (
          <CustomerAccountView
            onNavigate={handleNavigate}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* ADMIN DEDICATED LOGIN */}
        {currentView === 'admin-login' && (
          <AdminLoginView
            onSuccess={() => handleNavigate('admin')}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* ADMIN PROTECTED DASHBOARD */}
        {currentView === 'admin' && (
          authLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">جاري التحقق من صلاحيات المدير...</p>
              </div>
            </div>
          ) : isAdmin ? (
            <AdminDashboardView
              siteSettings={siteSettings}
              onRefreshSettings={handleRefreshSettings}
              onNavigate={handleNavigate}
            />
          ) : (
            <AdminLoginView
              onSuccess={() => handleNavigate('admin')}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}

        {currentView === 'policies' && (
          <PoliciesView
            siteSettings={siteSettings}
          />
        )}

        {currentView === 'contact' && (
          <ContactView
            siteSettings={siteSettings}
          />
        )}
      </main>

      {/* Customer Footer is hidden during dedicated Admin Login page */}
      {currentView !== 'admin-login' && (
        <Footer
          siteSettings={siteSettings}
          onNavigate={handleNavigate}
        />
      )}

      {/* Auth Modal for Customers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onNavigateToAdmin={() => handleNavigate('admin-login')}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <MainLayout />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

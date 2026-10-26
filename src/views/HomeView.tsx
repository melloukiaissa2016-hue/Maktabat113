import React from 'react';
import {
  Printer,
  ShoppingBag,
  FileText,
  FileCheck2,
  Briefcase,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  Truck,
  Sparkles,
  Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product, JobOffer, SiteSettings } from '../types';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  featuredProducts: Product[];
  recentJobs: JobOffer[];
  siteSettings: SiteSettings;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  featuredProducts,
  recentJobs,
  siteSettings
}) => {
  const { t, direction, language } = useLanguage();
  const { addItem } = useCart();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl">
        {/* Decorative background circles */}
        <div className="absolute top-0 end-0 -mt-20 -me-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-20 -ms-20 w-80 h-80 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs sm:text-sm font-bold backdrop-blur-xs">
              <Sparkles className="w-4 h-4" />
              <span>مرحباً بكم في {siteSettings.siteName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              {t('heroTitle')}
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-lg max-w-2xl leading-relaxed font-normal">
              {t('heroDesc')}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                onClick={() => onNavigate('print')}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <Printer className="w-5 h-5 text-emerald-700" />
                <span>{t('heroOrderPrint')}</span>
                <Arrow className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('store')}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/50 rounded-2xl font-bold text-sm sm:text-base backdrop-blur-xs transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('heroBrowseStore')}</span>
              </button>

              <button
                onClick={() => onNavigate('research')}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl font-black text-sm sm:text-base shadow-md transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>{t('heroSubmitResearch')}</span>
              </button>
            </div>

            {/* Micro value props */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-emerald-700/50 text-xs sm:text-sm text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>طباعة ليزرية فورية</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>سرية وأمان الملفات</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>توصيل أو استلام مباشر</span>
              </div>
            </div>
          </div>

          {/* Quick interactive order tracker box */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl text-white">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('trackTitle')}</h3>
                  <p className="text-xs text-emerald-200">{t('trackDesc')}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => onNavigate('track')}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>فحص حالة الطلب برقم المرجع</span>
                  <Arrow className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-emerald-200/80">
                  مثال: ORD-10294 أو PRN-40291 أو RES-98201
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            {t('quickServices')}
          </h2>
          <p className="text-sm text-slate-500">
            خدمات متكاملة صممت بعناية لتلبية احتياجات التلاميذ والطلبة والموظفين والمواطنين
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Service 1: Printing */}
          <div 
            onClick={() => onNavigate('print')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Printer className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('servicePrintTitle')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('servicePrintDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs sm:text-sm pt-2">
              <span>طلب طباعة الآن</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 2: Research & Thesis */}
          <div 
            onClick={() => onNavigate('research')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('serviceResearchTitle')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('serviceResearchDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs sm:text-sm pt-2">
              <span>إرسال مذكرة أو بحث</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 3: Documents */}
          <div 
            onClick={() => onNavigate('documents')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('serviceDocTitle')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('serviceDocDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs sm:text-sm pt-2">
              <span>استخراج الوثائق الإدارية</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 4: Store & Supplies */}
          <div 
            onClick={() => onNavigate('store')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('navStore')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                كراريس، أقلام، أدوات هندسية، حقائب، ورق طباعة، وألعاب تعليمية بجودة عالية.
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs sm:text-sm pt-2">
              <span>تصفح المنتجات والمخزون</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 5: Job Offers */}
          <div 
            onClick={() => onNavigate('jobs')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('serviceJobTitle')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('serviceJobDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs sm:text-sm pt-2">
              <span>عرض إعلانات التوظيف</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 6: Lessons Bank */}
          <div 
            onClick={() => onNavigate('lessons')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-rose-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('serviceLessonTitle')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {t('serviceLessonDesc')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs sm:text-sm pt-2">
              <span>تحميل الدروس والتمارين</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('featuredProducts')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              مختارات من أفضل الأدوات واللوازم المدرسية والمكتبية المتوفرة حالياً
            </p>
          </div>
          <button
            onClick={() => onNavigate('store')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>عرض المتجر كاملاً</span>
            <Arrow className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const displayName = language === 'fr' && product.nameFr ? product.nameFr : (language === 'en' && product.nameEn ? product.nameEn : product.name);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.imageUrl}
                    alt={displayName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 end-3 px-2.5 py-1 bg-rose-500 text-white text-xs font-black rounded-lg shadow-sm">
                      تخفيض
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 mb-2">
                      {displayName}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-black text-emerald-700">
                        {hasDiscount ? product.discountPrice : product.price} {t('currency')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.price} {t('currency')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addItem(product, 1)}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('addToCart')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Job Offers Banner */}
      {recentJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>جديد سوق العمل والتوظيف</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">أحدث مسابقات وعروض التوظيف</h2>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                عرض كل الإعلانات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.slice(0, 2).map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigate('jobs')}
                  className="p-5 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2.5 py-0.5 bg-purple-400/20 text-purple-300 rounded-md font-bold">
                      {job.wilaya}
                    </span>
                    {job.deadline && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>آخر أجل: {job.deadline}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">{job.title}</h4>
                  <p className="text-xs text-slate-400">{job.organization}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

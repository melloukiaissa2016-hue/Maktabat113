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
  Search,
  Smartphone,
  Receipt
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product, JobOffer, SiteSettings } from '../types';
import { AlgeriaFlag } from '../components/AlgeriaFlag';

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
      <section 
        className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl hero-gradient"
        style={{
          backgroundColor: '#064e3b',
          backgroundImage: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          color: '#ffffff'
        }}
      >
        {/* Decorative background circles */}
        <div className="absolute top-0 end-0 -mt-20 -me-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-20 -ms-20 w-80 h-80 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                color: '#a7f3d0',
                borderColor: 'rgba(52, 211, 153, 0.4)'
              }}
            >
              <AlgeriaFlag size="xs" shape="circle" />
              <span>مرحباً بكم في {siteSettings.siteName} 🇩🇿</span>
            </div>

            <h1 
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] hero-title"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {t('heroTitle')}
            </h1>

            <p 
              className="text-sm sm:text-lg max-w-2xl leading-relaxed font-semibold hero-subtitle"
              style={{
                color: '#d1fae5',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              {t('heroDesc')}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                onClick={() => onNavigate('print')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#064e3b'
                }}
              >
                <Printer className="w-5 h-5 text-[#047857]" />
                <span className="font-black">{t('heroOrderPrint')}</span>
                <Arrow className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('store')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer border"
                style={{
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  borderColor: '#10b981'
                }}
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                <span>{t('heroBrowseStore')}</span>
              </button>

              <button
                onClick={() => onNavigate('research')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-md transition-all cursor-pointer"
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#0f172a'
                }}
              >
                <FileText className="w-5 h-5 text-[#0f172a]" />
                <span>{t('heroSubmitResearch')}</span>
              </button>
            </div>

            {/* Micro value props */}
            <div 
              className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t text-xs sm:text-sm font-bold"
              style={{
                borderColor: 'rgba(5, 150, 105, 0.4)',
                color: '#a7f3d0'
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                <span>طباعة ليزرية فورية</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#34d399] shrink-0" />
                <span>سرية وأمان الملفات</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Truck className="w-4 h-4 text-[#34d399] shrink-0" />
                <span>توصيل أو استلام مباشر</span>
              </div>
            </div>
          </div>

          {/* Quick interactive order tracker box */}
          <div className="lg:col-span-5">
            <div 
              className="p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border"
              style={{
                backgroundColor: '#022c22',
                borderColor: '#059669',
                color: '#ffffff'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(5, 150, 105, 0.3)',
                    color: '#ffffff'
                  }}
                >
                  <Search className="w-6 h-6 text-[#34d399]" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white" style={{ color: '#ffffff' }}>{t('trackTitle')}</h3>
                  <p className="text-xs font-medium" style={{ color: '#a7f3d0' }}>{t('trackDesc')}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => onNavigate('track')}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: '#10b981',
                    color: '#022c22'
                  }}
                >
                  <span>فحص حالة الطلب برقم المرجع</span>
                  <Arrow className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center font-medium" style={{ color: '#a7f3d0' }}>
                  مثال: ORD-10294 أو PRN-40291 أو RES-98201
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Historic Algerian Revolution Commemorative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative overflow-hidden rounded-3xl border shadow-xl p-6 sm:p-10 text-white"
          style={{
            backgroundColor: '#032014',
            backgroundImage: 'radial-gradient(ellipse at top right, #064e3b 0%, #022416 60%, #01140c 100%)',
            borderColor: '#065f46'
          }}
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 end-0 -mt-16 -me-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Historic Image Container (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div 
                className="relative w-full rounded-2xl overflow-hidden p-2 sm:p-3 shadow-2xl border transition-all duration-300"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e3a2b'
                }}
              >
                {/* Official Badge on Image corner */}
                <div className="absolute top-4 start-4 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white shadow-md">
                  <AlgeriaFlag size="xs" shape="circle" />
                  <span>جيش التحرير الوطني ALN</span>
                </div>

                {/* The Historic Photograph (Maintained Original Ratio & Quality) */}
                <img
                  src="/assets/aistudio/IMG_054ee44c-6ecb-408e-a111-cc2e3f3ee054_7500a4b9.jpg"
                  alt="مجاهدو جيش التحرير الوطني يرفعون راية الجزائر خفاقة"
                  className="w-full h-auto max-h-[460px] object-contain sm:object-cover rounded-xl shadow-inner select-none transition-transform duration-500 hover:scale-[1.01]"
                  loading="eager"
                />

                {/* Image caption */}
                <div className="pt-2.5 px-2 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/90 gap-2 border-t border-white/10 mt-2">
                  <span className="font-semibold text-center sm:text-start">
                    صورة تاريخية خالدة: رفع العلم الوطني الجزائري خلال الثورة التحريرية المجيدة
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 shrink-0 font-bold">
                    1954 - 1962 🇩🇿
                  </span>
                </div>
              </div>
            </div>

            {/* Commemorative Words & National Identity (5 cols) */}
            <div className="lg:col-span-5 space-y-5 text-center lg:text-start">
              <div 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: 'rgba(5, 150, 105, 0.25)',
                  color: '#6ee7b7',
                  borderColor: 'rgba(52, 211, 153, 0.3)'
                }}
              >
                <AlgeriaFlag size="xs" shape="circle" />
                <span>1 نوفمبر 1954 • عيد الثورة التحريرية المجيدة</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                ذكرى اندلاع الثورة التحريرية المظفرة
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                في ذكرى أول نوفمبر الخالدة، نقف وقفة إجلال وإكبار أمام أرواح شهدائنا الأبرار ومجاهدينا البواسل الذين خاضوا أعظم ثورة تحريرية في التاريخ المعاصر لترتفع راية الجزائر خفاقة عالية حرة مستقلة.
              </p>

              <div 
                className="p-4 rounded-2xl border text-xs sm:text-sm font-bold text-amber-200 leading-relaxed space-y-1"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'rgba(245, 158, 11, 0.3)'
                }}
              >
                <p className="text-white font-black text-sm sm:text-base">
                  تحيا الجزائر 🇩🇿 المجد والخلود لشهدائنا الأبرار.
                </p>
                <p className="text-[11px] text-emerald-300 font-normal">
                  منصة Maktaba113 تواصل مسيرة البناء والعلم في خدمة الطلبة والباحثين والوطن.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => onNavigate('print')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوثائق والبحوث</span>
                </button>
                <button
                  onClick={() => onNavigate('documents')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>مسابقات التوظيف والاستخراج</span>
                </button>
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
              <span>التسجيل أو استخراج الوثائق</span>
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

          {/* Service 7: Flexy & Idoom Fibre */}
          <div 
            onClick={() => onNavigate('flexy')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">شحن الأرصدة وإيدوم فيبر</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                شحن فليكسي موبيليس، جيزي، أوريدو، وتعبئة اشتراك إيدوم فيبر لاتصالات الجزائر برقم العقد بكل سهولة وأمان.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs sm:text-sm pt-2">
              <span>شحن رصيد الآن</span>
              <Arrow className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service 8: Bill Payments */}
          <div 
            onClick={() => onNavigate('bills')}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">تسديد الفواتير العمومية</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                تسديد فواتير الكهرباء والغاز سونلغاز، الجزائرية للمياه ADE، والهاتف الثابت والإنترنت مع تسليم الوصل الرسمي.
              </p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs sm:text-sm pt-2">
              <span>تسديد فاتورة الآن</span>
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

import React from 'react';
import { Printer, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

interface FooterProps {
  siteSettings: SiteSettings;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings, onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white">{siteSettings.siteName}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('siteSubtitle')}. منصة عصرية متكاملة تقدم أعلى مستويات الجودة في الطباعة، وتوفير الأدوات المدرسية والمكتبية، وإعداد البحوث وتسهيل المعاملات.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>خصوصية تامة وأمان كامل لملفاتكم</span>
            </div>
          </div>

          {/* Col 2: Services Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-s-2 border-emerald-500 ps-2.5">
              خدماتنا الرئيسية
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('print')} className="hover:text-emerald-400 transition-colors">
                  {t('navPrint')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('store')} className="hover:text-emerald-400 transition-colors">
                  {t('navStore')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-emerald-400 transition-colors">
                  {t('navResearch')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('documents')} className="hover:text-emerald-400 transition-colors">
                  {t('navDocuments')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('jobs')} className="hover:text-emerald-400 transition-colors">
                  {t('navJobs')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('lessons')} className="hover:text-emerald-400 transition-colors">
                  {t('navLessons')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-s-2 border-emerald-500 ps-2.5">
              خدمة الزبائن والسياسات
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-emerald-400 transition-colors">
                  {t('navTrack')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-emerald-400 transition-colors">
                  {t('fileRetentionPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-emerald-400 transition-colors">
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policies')} className="hover:text-emerald-400 transition-colors">
                  {t('termsOfService')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  {t('navContact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-s-2 border-emerald-500 ps-2.5">
              التواصل وأوقات العمل
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-emerald-400 transition-colors font-mono"
                  dir="ltr"
                >
                  {siteSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {siteSettings.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{siteSettings.workingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('rightsReserved')}</p>
          
          <button
            onClick={() => onNavigate('admin-login')}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs text-slate-500"
            title="بوابة دخول الإدارة"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 hover:text-emerald-500" />
            <span>بوابة الإدارة (Maktaba113)</span>
          </button>

          <div className="flex items-center gap-1 text-slate-400">
            <span>منصة متكاملة بنيت بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>لخدمتكم</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

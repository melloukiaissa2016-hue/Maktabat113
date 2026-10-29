import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { AlgeriaFlag } from './AlgeriaFlag';

interface NovemberBannerProps {
  onDismiss?: () => void;
}

export const NovemberBanner: React.FC<NovemberBannerProps> = ({ onDismiss }) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('maktaba113_nov_dismissed') === 'true';
    }
    return false;
  });

  if (dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('maktaba113_nov_dismissed', 'true');
    }
    if (onDismiss) onDismiss();
  };

  const slogan = '🇩🇿 اليوم أول نوفمبر 🇩🇿 • ذكرى اندلاع الثورة التحريرية المجيدة (1 نوفمبر 1954) • المجد والخلود لشهدائنا الأبرار • تحيا الجزائر حرة مستقلة 🇩🇿';

  return (
    <div
      className="relative z-50 text-white overflow-hidden select-none border-b border-emerald-950 font-['Cairo',sans-serif] shadow-md"
      style={{
        backgroundColor: '#006233',
        backgroundImage: 'linear-gradient(90deg, #004d28 0%, #006233 35%, #065f46 65%, #004d28 100%)',
        color: '#ffffff'
      }}
      role="region"
      aria-label="شريط ذكرى أول نوفمبر المجيدة"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-10 sm:h-11 gap-3">
        {/* Right Badge / Flag Icon */}
        <div className="flex items-center gap-2 shrink-0 py-1 pe-2 sm:pe-3 border-e border-white/20">
          <AlgeriaFlag size="sm" shape="circle" className="ring-2 ring-white/40" />
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-100 bg-white/10 px-2 py-0.5 rounded-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>1 نوفمبر 1954</span>
          </span>
        </div>

        {/* Continuous Marquee Area */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center group">
          <div
            className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:pause-marquee"
            style={{
              animation: 'marquee-scroll 28s linear infinite',
              display: 'inline-flex'
            }}
          >
            <span className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-3">
              {slogan}
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wide text-amber-200 flex items-center gap-3" aria-hidden="true">
              ★ {slogan}
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-3" aria-hidden="true">
              ★ {slogan}
            </span>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <div className="flex items-center gap-1 shrink-0 ps-2">
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="إخفاء الشريط مؤقتاً"
            aria-label="إغلاق الشريط"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

interface ContactViewProps {
  siteSettings: SiteSettings;
}

export const ContactView: React.FC<ContactViewProps> = ({ siteSettings }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setSent(true);
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-6 sm:p-12 text-white shadow-xl text-center max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-black mb-3">{t('contactTitle')}</h1>
        <p className="text-emerald-100 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
          {t('contactDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              بيانات التواصل المباشرة
            </h3>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">{t('phoneLabel')}</span>
                <a
                  href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-sm font-black text-slate-900 hover:text-emerald-700 font-mono transition-colors"
                  dir="ltr"
                >
                  {siteSettings.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">{t('whatsappLabel')}</span>
                <a
                  href={`https://wa.me/${siteSettings.phoneWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-black text-emerald-700 hover:underline font-mono"
                  dir="ltr"
                >
                  {siteSettings.phoneWhatsApp}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">البريد الإلكتروني</span>
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors"
                >
                  {siteSettings.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">{t('addressLabel')}</span>
                <span className="text-sm text-slate-800">{siteSettings.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">{t('workingHoursLabel')}</span>
                <span className="text-sm text-slate-800">{siteSettings.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
              أرسل استفسارك أو طلبك الخاص
            </h3>

            {sent && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>شكراً لتواصلك! تم استلام رسالتك وسنرد عليك في أقرب وقت.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fullName')} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم واللقب"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phoneNumber')} *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550 00 00 00"
                dir="ltr"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-start"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نص الرسالة أو الاستفسار *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفسارك، عنوان المذكرة، أو الكميات المطلوبة..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{t('sendMessage')}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

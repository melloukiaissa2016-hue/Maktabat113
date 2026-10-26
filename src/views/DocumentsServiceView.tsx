import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createPrintRequest, generateReferenceCode } from '../services/dbService';

interface DocumentsServiceViewProps {
  onNavigate: (view: string) => void;
}

export const DocumentsServiceView: React.FC<DocumentsServiceViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [docType, setDocType] = useState('docBirth');
  const [nationalId, setNationalId] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const docOptions = [
    { id: 'docBirth', label: 'شهادة الميلاد / عقد الزواج / الوفاة (بوابة وزارة الداخلية)' },
    { id: 'docChifa', label: 'تجديد واستخراج وثائق بطاقة الشفاء والضمان الاجتماعي' },
    { id: 'docJudicial', label: 'صحيفة السوابق العدلية رقم 03 (وزارة العدل)' },
    { id: 'docAnem', label: 'منحة البطالة وشهادة التسجيل في وسيط ANEM' },
    { id: 'docResidence', label: 'استمارات بطاقة الإقامة والبلدية' },
    { id: 'docOther', label: 'استمارة إدارية أخرى أو منصة حكومية' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى كتابة الاسم ورقم الهاتف للتواصل وتأكيد المعاملة');
      return;
    }

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('DOC');

    try {
      const selectedDocLabel = docOptions.find((d) => d.id === docType)?.label || docType;
      await createPrintRequest({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        files: [],
        copies: 1,
        colorMode: 'bw',
        sidedness: 'single',
        paperSize: 'A4',
        pageRange: '1',
        notes: `[طلب استخراج وثيقة إدارية: ${selectedDocLabel}] رقم التعريف/الملاحظات: ${nationalId}. تفاصيل إضافية: ${notes}`,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setConfirmedCode(referenceCode);
    } catch (err: unknown) {
      console.error('Document extraction request error:', err);
      setErrorMsg('فشل إرسال طلب استخراج الوثيقة، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم تسجيل طلب استخراج وثيقتك بنجاح!
            </h2>
            <p className="text-sm text-slate-600">
              سيقوم موظف الاستقبال بالمكتبة بالتحقق من الطلب والتواصل معك هاتفياً على ({customerPhone}) فور استخراجها وتجهيز النسخ الورقية.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-teal-700">
                {confirmedCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              متابعة حالة المعاملة
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setNationalId('');
                setNotes('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              طلب استخراج وثيقة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck2 className="w-9 h-9 text-teal-200" />
          <h1 className="text-2xl sm:text-3xl font-black">{t('docServiceTitle')}</h1>
        </div>
        <p className="text-teal-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          {t('docServiceDesc')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          حدد نوع الوثيقة المطلوبة
        </h2>

        {/* Document type radio pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docOptions.map((opt) => (
            <label
              key={opt.id}
              onClick={() => setDocType(opt.id)}
              className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                docType === opt.id
                  ? 'border-teal-600 bg-teal-50/60 text-teal-950 ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="docType"
                checked={docType === opt.id}
                onChange={() => setDocType(opt.id)}
                className="mt-1 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-xs sm:text-sm font-bold leading-snug">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Identifying Details */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>رقم التعريف الوطني / رقم التسجيل / المعلومات التعريفية</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="مثال: رقم بطاقة التعريف أو تاريخ ومكان الميلاد لاستخراج الشهادة"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fullName')} *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="محمد بن سالم"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phoneNumber')} *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0661 23 45 67"
                dir="ltr"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-start"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('orderNotes')}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل حول عدد النسخ أو صيغة الطباعة المطلوبة..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Privacy assurance */}
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
          <ShieldAlert className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            بياناتك الشخصية وأرقامك التعريفية تُعامل بأقصى درجات الأمان والسرية المهنية، وتُحذف فور إتمام عملية السحب والطباعة والتسليم.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? t('loading') : 'إرسال طلب الاستخراج والطباعة'}</span>
        </button>
      </form>

    </div>
  );
};

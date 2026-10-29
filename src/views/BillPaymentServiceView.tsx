import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Upload,
  FileText,
  Trash2,
  Eye,
  ShieldCheck,
  Zap,
  Droplets,
  PhoneCall,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createBillPayment, generateReferenceCode } from '../services/dbService';
import { validateFile, uploadFile, formatFileSize } from '../services/storageService';
import { UploadedFileInfo } from '../types';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface BillPaymentServiceViewProps {
  onNavigate: (view: string) => void;
}

export const BillPaymentServiceView: React.FC<BillPaymentServiceViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [billType, setBillType] = useState<'electricity_gas' | 'water' | 'landline' | 'internet'>('electricity_gas');
  const [billReference, setBillReference] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');

  // File upload state
  const [uploadedBill, setUploadedBill] = useState<UploadedFileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const billProviders = [
    {
      id: 'electricity_gas',
      name: 'سونلغاز (Sonelgaz)',
      desc: 'فواتير الكهرباء والغاز لجميع المقاطعات',
      icon: Zap,
      color: 'bg-amber-500',
      refPlaceholder: 'رقم الفاتورة أو مرجع السند (Référence facture / N° Client)'
    },
    {
      id: 'water',
      name: 'الجزائرية للمياه (ADE)',
      desc: 'فواتير استهلاك مياه الشرب والتطهير',
      icon: Droplets,
      color: 'bg-sky-500',
      refPlaceholder: 'رقم الزبون أو رقم وصل المياه'
    },
    {
      id: 'landline',
      name: 'الهاتف الثابت (Algérie Télécom)',
      desc: 'اشتراكات وخطوط الهاتف الثابت المنزلي والتجاري',
      icon: PhoneCall,
      color: 'bg-emerald-600',
      refPlaceholder: 'رقم الهاتف الثابت (مثال: 021 XX XX XX)'
    },
    {
      id: 'internet',
      name: 'إنترنت اتصالات الجزائر (ADSL / Fibre / 4G)',
      desc: 'تجديد وتسديد فواتير واشتراكات الإنترنت',
      icon: Globe,
      color: 'bg-indigo-600',
      refPlaceholder: 'رقم العقد أو رقم الخط المرتبط بالإنترنت'
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'الملف المختار غير صالح');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      const info = await uploadFile(file);
      setUploadedBill(info);
    } catch (err) {
      console.error('Failed to upload bill photo:', err);
      setErrorMsg('فشل رفع صورة الفاتورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!billReference.trim()) {
      setErrorMsg('يرجى إدخال رقم الفاتورة أو مرجع السند');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ الفاتورة صحيحاً بالدينار الجزائري');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف للتواصل وتأكيد التسديد');
      return;
    }

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('BIL');

    try {
      await createBillPayment({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        billType,
        billReference: billReference.trim(),
        amount: numAmount,
        billFile: uploadedBill || undefined,
        notes: notes.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setConfirmedCode(referenceCode);
    } catch (err) {
      console.error('Failed to submit bill payment:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل طلب تسديد الفاتورة، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم تسجيل طلب تسديد الفاتورة بنجاح!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              سيقوم موظف مكتبة 113 بالتحقق من الفاتورة ومبلغها والتواصل معك هاتفياً على ({customerPhone}) لتسديدها في الوكالة الرسمية واستلام وصل الدفع الأصلي (Quittance).
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-indigo-700">
                {confirmedCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              متابعة حالة التسديد
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setBillReference('');
                setAmount('');
                setUploadedBill(null);
                setNotes('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              تسديد فاتورة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-9 h-9 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-black">تسديد الفواتير والخدمات العمومية</h1>
        </div>
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed">
          وفّر وقتك وتجنب طوابير الانتظار. مكتبة 113 تتولى تسديد فواتير الكهرباء والغاز (سونلغاز)، المياه (ADE)، والهاتف والإنترنت، مع تزويدك بالوصل الرسمي.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Step 1: Provider selection */}
        <div>
          <label className="block text-sm font-black text-slate-900 mb-3">1. حدد نوع الفاتورة أو المرفق *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {billProviders.map((provider) => {
              const Icon = provider.icon;
              const isSelected = billType === provider.id;
              return (
                <button
                  type="button"
                  key={provider.id}
                  onClick={() => setBillType(provider.id as any)}
                  className={`p-4 rounded-2xl border text-start flex items-start gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl text-white ${provider.color} shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">{provider.name}</span>
                    <span className="text-xs text-slate-500 leading-snug">{provider.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Bill reference & amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رقم الفاتورة أو مرجع السند *
            </label>
            <input
              type="text"
              required
              value={billReference}
              onChange={(e) => setBillReference(e.target.value)}
              placeholder={billProviders.find((p) => p.id === billType)?.refPlaceholder}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              مبلغ الفاتورة (بالدينار الجزائري DZD) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="50"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="مثال: 3250"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute end-3 top-2.5 text-xs font-bold text-slate-400">DZD</span>
            </div>
          </div>
        </div>

        {/* Step 3: Attach bill photo / document */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            صورة أو ملف الفاتورة الأصلية (اختياري ولكنه يُفضل لتأكيد البيانات)
          </label>
          
          {uploadedBill ? (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-indigo-200 text-indigo-700 rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="block text-xs font-bold text-slate-900 truncate">{uploadedBill.originalName}</span>
                  <span className="text-[11px] text-slate-500">{formatFileSize(uploadedBill.size)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewFile(uploadedBill)}
                  className="p-1.5 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                  title="معاينة الملف"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setUploadedBill(null)}
                  className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="حذف الملف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer block transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="block text-xs font-bold text-slate-700">اضغط لرفع صورة الفاتورة أو ملف PDF</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">JPG, PNG, PDF (الحد الأقصى 25 ميغابايت)</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Step 4: Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fullName')} *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="اسم صاحب الفاتورة"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phoneNumber')} *</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0664 75 12 71"
              dir="ltr"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-start"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني (اختياري)</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="votre.email@example.com"
            dir="ltr"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-start font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات إضافية</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: يرجى إرسال نسخة من وصل التسديد عبر واتساب فور إتمامه..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Legal & Service Notice */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3 text-xs text-indigo-950">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>ضمان الخدمة والوصل الأصلي:</strong> تقوم مكتبة 113 بالدفع الفعلي لدى مراكز ومصالح التسديد المعتمدة. عند إتمام العملية، يتم تسليمك الوصل المالي الأصلي الصادر من المرفق (سونلغاز، الجزائرية للمياه، أو اتصالات الجزائر) لإثبات براءة الذمة.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-5 h-5" />
          <span>{isSubmitting ? 'جاري تسجيل الطلب...' : 'إرسال طلب تسديد الفاتورة'}</span>
        </button>
      </form>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};

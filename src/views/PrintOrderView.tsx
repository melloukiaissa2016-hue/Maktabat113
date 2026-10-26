import React, { useState } from 'react';
import {
  Printer,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { uploadFile, formatFileSize } from '../services/storageService';
import { createPrintRequest, generateReferenceCode } from '../services/dbService';
import { UploadedFileInfo, SiteSettings } from '../types';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface PrintOrderViewProps {
  onNavigate: (view: string) => void;
  siteSettings: SiteSettings;
}

export const PrintOrderView: React.FC<PrintOrderViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  // Print Settings
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [sidedness, setSidedness] = useState<'single' | 'double'>('single');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('');

  // Customer Info
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setErrorMsg(null);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadingName(file.name);
      setUploadProgress(0);

      try {
        const uploaded = await uploadFile(file, 'print_jobs', (progress) => {
          setUploadProgress(progress);
        });
        setFiles((prev) => [...prev, uploaded]);
      } catch (err: unknown) {
        console.error('File upload error:', err);
        setErrorMsg(err instanceof Error ? err.message : 'فشل رفع الملف');
        break;
      }
    }

    setUploadProgress(null);
    setUploadingName(null);
    // Reset file input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (files.length === 0) {
      setErrorMsg('يرجى رفع ملف واحد على الأقل للطباعة (PDF، Word، أو صور)');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى كتابة الاسم ورقم الهاتف للتواصل وتأكيد الطلب');
      return;
    }

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('PRN');

    try {
      await createPrintRequest({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        files,
        copies,
        colorMode,
        sidedness,
        paperSize,
        pageRange: pageRangeMode === 'all' ? 'all' : (customRange.trim() || 'all'),
        notes: notes.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setConfirmedCode(referenceCode);
    } catch (err: unknown) {
      console.error('Print request error:', err);
      setErrorMsg('فشل إرسال طلب الطباعة، يرجى التحقق من اتصالك والمحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم استلام ملفاتك وطلب الطباعة بنجاح!
            </h2>
            <p className="text-sm text-slate-600">
              يقوم فريق المكتبة الآن بمراجعة الملفات وتجهيزها للطباعة بجودة عالية. سنتصل بك على الهاتف ({customerPhone}) فور جهوزيتها.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-700">
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
            <p className="text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200/60 inline-block">
              {t('keepRefNote')}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              متابعة حالة الطلب
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setFiles([]);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              طلب طباعة ملف آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Printer className="w-8 h-8 text-emerald-300" />
          <h1 className="text-2xl sm:text-3xl font-black">{t('printTitle')}</h1>
        </div>
        <p className="text-emerald-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          {t('printDesc')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-8">
        
        {/* Step 1: Upload Files */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>رفع المستندات والملفات</span>
            </h2>
            <span className="text-xs text-slate-400">PDF, Word, JPG, PNG</span>
          </div>

          {/* Drag & Drop Upload Container */}
          <label className="relative border-2 border-dashed border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">{t('dragDropFiles')}</h4>
            <p className="text-xs text-slate-500 mb-2">{t('supportedFormats')}</p>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              {t('maxFileSize')}
            </span>
          </label>

          {/* Uploading Status Progress */}
          {uploadProgress !== null && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="truncate max-w-[250px]">{t('uploading')} {uploadingName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Uploaded Files Queue */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-600">الملفات المرفوعة ({files.length}):</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {files.map((file, idx) => (
                  <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                          {file.originalName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title={t('view')}
                      >
                        <Eye className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Print Options */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>خيارات وإعدادات الطباعة</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Color Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('colorOption')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setColorMode('bw')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    colorMode === 'bw'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {t('colorBw')}
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    colorMode === 'color'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {t('colorColor')}
                </button>
              </div>
            </div>

            {/* Sidedness */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('sidednessOption')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSidedness('single')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    sidedness === 'single'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {t('singleSided')}
                </button>
                <button
                  type="button"
                  onClick={() => setSidedness('double')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    sidedness === 'double'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {t('doubleSided')}
                </button>
              </div>
            </div>

            {/* Paper Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('paperSize')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    paperSize === 'A4'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  A4 (المقاس القياسي)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('A3')}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                    paperSize === 'A3'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  A3 (مضاعف الحجم)
                </button>
              </div>
            </div>

            {/* Copies Counter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('numberOfCopies')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-500 font-medium">نسخة</span>
              </div>
            </div>

            {/* Page Range */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('pageRange')}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setPageRangeMode('all')}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    pageRangeMode === 'all'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {t('allPages')}
                </button>
                <button
                  type="button"
                  onClick={() => setPageRangeMode('custom')}
                  className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                    pageRangeMode === 'custom'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  صفحات مخصصة
                </button>
                {pageRangeMode === 'custom' && (
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="مثال: 1-10, 15, 20"
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Step 3: Customer Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>بيانات الاتصال والاستلام</span>
            </h2>
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phoneNumber')} *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0550 12 34 56"
                dir="ltr"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-start"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('orderNotes')}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي توضيحات للمدير حول نوع الورق، التجليد أو موعد الاستلام..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pricing Notice */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('priceEstimationNotice')} تسعيرة طباعة A4 أسود وأبيض تبدأ من 5 د.ج للصفحة، والألوان من 20 د.ج، مع خصومات خاصة على الكميات والمذكرات الكبيرة.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? t('loading') : t('submitPrintOrder')}
          </button>
        </div>

      </form>

      {/* Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
};

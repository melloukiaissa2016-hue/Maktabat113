import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Trash2,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { uploadFile, formatFileSize } from '../services/storageService';
import { createResearchRequest, generateReferenceCode } from '../services/dbService';
import { UploadedFileInfo } from '../types';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface ResearchOrderViewProps {
  onNavigate: (view: string) => void;
}

export const ResearchOrderView: React.FC<ResearchOrderViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [academicLevel, setAcademicLevel] = useState('master');
  const [specialty, setSpecialty] = useState('');
  const [serviceType, setServiceType] = useState('serviceFull');
  const [deadline, setDeadline] = useState('');
  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [notes, setNotes] = useState('');

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
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
        const uploaded = await uploadFile(file, 'research_docs', (p) => setUploadProgress(p));
        setFiles((prev) => [...prev, uploaded]);
      } catch (err: unknown) {
        console.error('File upload error:', err);
        setErrorMsg(err instanceof Error ? err.message : 'فشل رفع الملف');
        break;
      }
    }
    setUploadProgress(null);
    setUploadingName(null);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('يرجى إدخال عنوان المذكرة أو البحث');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف للتواصل');
      return;
    }

    if (files.length === 0) {
      setErrorMsg('يرجى إرفاق ملف المذكرة على الأقل بصيغة Word أو PDF');
      return;
    }

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('RES');

    try {
      await createResearchRequest({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        title: title.trim(),
        academicLevel,
        specialty: specialty.trim() || 'عام',
        serviceType,
        deadline: deadline || undefined,
        files,
        notes: notes.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setConfirmedCode(referenceCode);
    } catch (err: unknown) {
      console.error('Research request error:', err);
      setErrorMsg('فشل حفظ طلب المذكرة، يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم إرسال طلب المذكرة بنجاح!
            </h2>
            <p className="text-sm text-slate-600">
              يقوم المستشار المختص بمراجعة عدد الصفحات ومتطلبات التجليد والتنسيق والتواصل معكم هاتفياً على ({customerPhone}) لتحديد التكلفة النهائية وموعد التسليم.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-blue-700">
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
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              متابعة حالة المذكرة
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setFiles([]);
                setTitle('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              إرسال طلب آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-10 text-white shadow-lg hero-gradient"
        style={{
          backgroundColor: '#1e1b4b',
          backgroundImage: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
          color: '#ffffff'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-9 h-9 text-[#93c5fd]" />
          <h1 
            className="text-2xl sm:text-3xl font-black"
            style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
          >
            {t('researchTitle')}
          </h1>
        </div>
        <p 
          className="text-xs sm:text-base max-w-2xl leading-relaxed font-semibold"
          style={{ color: '#e0e7ff', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
        >
          {t('researchDesc')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Academic Details */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>بيانات المذكرة أو البحث الأكاديمي</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('researchTopic')} *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: أثر الرقمنة على تحسين أداء المؤسسات الاقتصادية الجزائرية"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('academicLevel')}</label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="master">{t('levelMaster')}</option>
                <option value="license">{t('levelLicense')}</option>
                <option value="doctorate">{t('levelDoctorate')}</option>
                <option value="secondary">{t('levelSecondary')}</option>
                <option value="middle">{t('levelMiddle')}</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('specialty')}</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="علوم اقتصادية، إعلام آلي، حقوق، هندسة..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('serviceType')}</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="serviceFull">{t('serviceFull')}</option>
                <option value="servicePrintBind">{t('servicePrintBind')}</option>
                <option value="serviceFormatting">{t('serviceFormatting')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{t('deadlineNeeded')}</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Upload Thesis Files */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>{t('attachFiles')}</span>
          </h2>

          <label className="relative border-2 border-dashed border-blue-400/80 hover:border-blue-600 bg-blue-50/30 hover:bg-blue-50/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">اضغط لرفع ملفات المذكرة</h4>
            <p className="text-xs text-slate-500 mb-2">Word (.doc, .docx)، ملفات PDF، وملاحق الصور (حتى 100 ميغابايت لكل ملف)</p>
          </label>

          {uploadProgress !== null && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="truncate max-w-[250px]">{t('uploading')} {uploadingName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {files.map((file, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{file.originalName}</p>
                      <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg"
                      title={t('view')}
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            <span>{t('customerInfo')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fullName')} *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('phoneNumber')} *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0661 00 00 00"
                dir="ltr"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات إضافية حول التنسيق والتجليد</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="نوع التجليد المفضل (سلك أو حراري مقوى)، الألوان، عدد النسخ المطلوبة..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? t('loading') : t('submitResearchOrder')}
          </button>
        </div>

      </form>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
};

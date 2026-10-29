import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  HelpCircle,
  ShieldAlert,
  GraduationCap,
  FolderDown,
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  Info,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createDocumentRequest, generateReferenceCode } from '../services/dbService';
import { uploadFile, formatFileSize, triggerFileDownload, validateFile } from '../services/storageService';
import { UploadedFileInfo } from '../types';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface DocumentsServiceViewProps {
  onNavigate: (view: string) => void;
}

// 1. الخانة الأولى: التسجيل في المسابقات
const COMPETITION_OPTIONS = [
  { id: 'comp_teachers', label: 'مسابقة الأساتذة لجميع الأطوار' },
  { id: 'comp_taakod', label: 'منصة التعاقد للأساتذة' },
  { id: 'comp_concour_dz', label: 'منصة councour.dz' },
  { id: 'comp_judges', label: 'مسابقة القضاة' },
  { id: 'comp_paramedical', label: 'الشبه طبي بدون بكالوريا' },
  { id: 'comp_civil_protection', label: 'الحماية المدنية' },
  { id: 'comp_bac_bem', label: 'امتحانات Bac / BEM' },
  { id: 'comp_housing_aadl_lba', label: 'جميع الصيغ السكنية AADL / LBA' },
  { id: 'comp_correspondence', label: 'الدراسة بالمراسلة' },
  { id: 'comp_police', label: 'مسابقة الأمن الوطني (الشرطة)' },
  { id: 'comp_prisons', label: 'مسابقة إدارة السجون' },
  { id: 'comp_parents_space', label: 'فضاء الأولياء' },
  { id: 'comp_other', label: 'مسابقات أخرى (يرجى كتابة اسم المسابقة)' }
];

// 2. الخانة الثانية: استخراج الملفات
const EXTRACTION_OPTIONS = [
  { id: 'ext_social_insurance', label: 'وثيقة الانتساب للضمان الاجتماعي' },
  { id: 'ext_non_insurance', label: 'وثيقة عدم الانتساب' },
  { id: 'ext_judicial_record', label: 'صحيفة السوابق العدلية' },
  { id: 'ext_forms', label: 'استخراج الاستمارات (يرجى كتابة اسم الاستمارة)' },
  { id: 'ext_other_docs', label: 'استخراج وثائق أخرى (يرجى كتابة اسم الوثيقة)' }
];

export const DocumentsServiceView: React.FC<DocumentsServiceViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  // Selected Category & Service Item
  const [categoryType, setCategoryType] = useState<'competitions' | 'documents'>('competitions');
  const [selectedItemId, setSelectedItemId] = useState<string>('comp_teachers');
  const [customServiceName, setCustomServiceName] = useState('');

  // Customer Contact Info
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phoneNumber || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [nationalId, setNationalId] = useState('');
  const [notes, setNotes] = useState('');

  // File Upload State
  const [attachedFiles, setAttachedFiles] = useState<UploadedFileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle File Selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setUploadSuccessMsg(null);
    setIsUploading(true);
    setUploadProgress(10);

    const uploadedList: UploadedFileInfo[] = [];
    const errorsList: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);

      if (!validation.valid) {
        errorsList.push(`${file.name}: ${validation.error || 'نوع أو حجم الملف غير صالح'}`);
        continue;
      }

      try {
        const uploaded = await uploadFile(file, 'documents_requests', (p) => {
          setUploadProgress(Math.max(10, Math.round(((i + p / 100) / files.length) * 100)));
        });
        uploadedList.push(uploaded);
      } catch (err) {
        console.error('File upload error:', err);
        errorsList.push(`${file.name}: فشل رفع الملف، يرجى المحاولة بصيغة أخرى.`);
      }
    }

    if (uploadedList.length > 0) {
      setAttachedFiles((prev) => [...prev, ...uploadedList]);
      setUploadSuccessMsg(`تم رفع ${uploadedList.length} ملف بنجاح وهو محفوظ الآن.`);
    }

    if (errorsList.length > 0) {
      setErrorMsg(errorsList.join(' | '));
    }

    setIsUploading(false);
    setUploadProgress(null);
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى إدخال الاسم ورقم الهاتف للتواصل وتأكيد المعاملة');
      return;
    }

    // Strict Email Validation (Mandatory requirement)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setErrorMsg('البريد الإلكتروني إجباري ومطلوب بصيغة صحيحة (مثال: name@domain.com) لإرسال الإشعار والوثيقة المستخرجة');
      return;
    }

    // Determine the full service label
    let itemLabel = '';
    if (categoryType === 'competitions') {
      const found = COMPETITION_OPTIONS.find((c) => c.id === selectedItemId);
      itemLabel = found ? found.label : selectedItemId;
    } else {
      const found = EXTRACTION_OPTIONS.find((c) => c.id === selectedItemId);
      itemLabel = found ? found.label : selectedItemId;
    }

    // If custom name required
    const isCustomRequired =
      selectedItemId === 'comp_other' ||
      selectedItemId === 'ext_forms' ||
      selectedItemId === 'ext_other_docs';

    if (isCustomRequired && !customServiceName.trim()) {
      setErrorMsg('يرجى كتابة اسم المسابقة أو الاستمارة أو الوثيقة المطلوبة بالتحديد');
      return;
    }

    const docCategorySummary = isCustomRequired
      ? `${categoryType === 'competitions' ? 'التسجيل في المسابقات' : 'استخراج الملفات'}: ${customServiceName.trim()} (${itemLabel})`
      : `${categoryType === 'competitions' ? 'التسجيل في المسابقات' : 'استخراج الملفات'}: ${itemLabel}`;

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('DOC');

    try {
      await createDocumentRequest({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        serviceCategory: categoryType,
        serviceItem: itemLabel,
        customServiceName: customServiceName.trim() || undefined,
        docCategory: docCategorySummary,
        nationalIdOrNin: nationalId.trim() || undefined,
        notes: notes.trim() || undefined,
        attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setConfirmedCode(referenceCode);
    } catch (err: unknown) {
      console.error('Document/competition request error:', err);
      setErrorMsg('فشل إرسال طلبك، يرجى التحقق من الاتصال وإعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم تسجيل طلبك بنجاح!
            </h2>
            <p className="text-sm text-slate-600">
              وصل طلبك إلى لوحة الإدارة وسيقوم موظف الاستقبال بمكتبة 113 بمعالجته والتواصل معك هاتفياً على ({customerPhone}) أو عبر بريدك الإلكتروني.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-teal-700">
                {confirmedCode}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(confirmedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="نسخ رقم الطلب"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {attachedFiles.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-start space-y-1">
              <span className="font-bold block">الملفات المرفوعة مع الطلب ({attachedFiles.length}):</span>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                {attachedFiles.map((f, i) => (
                  <li key={i} className="truncate">
                    {f.originalName} ({formatFileSize(f.size)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              متابعة حالة الطلب
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setNationalId('');
                setNotes('');
                setAttachedFiles([]);
                setCustomServiceName('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              إرسال طلب جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustomInputRequired =
    selectedItemId === 'comp_other' ||
    selectedItemId === 'ext_forms' ||
    selectedItemId === 'ext_other_docs';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden hero-gradient"
        style={{
          backgroundColor: '#0f766e',
          backgroundImage: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #064e3b 100%)',
          color: '#ffffff'
        }}
      >
        <div className="relative z-10 space-y-2">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ccfbf1'
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5eead4]" />
            <span>خدمات المنصات الرسمية والإدارية</span>
          </div>
          <h1 
            className="text-2xl sm:text-4xl font-black tracking-tight"
            style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
          >
            التسجيل في المسابقات واستخراج الوثائق
          </h1>
          <p 
            className="text-xs sm:text-base max-w-3xl leading-relaxed font-semibold"
            style={{ color: '#e6fffa', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
          >
            منصة مخصصة وشاملة لتسهيل التسجيل في كافة المسابقات الوطنية والامتحانات الرسمية، وسحب واستخراج الوثائق والاستمارات الإدارية مع إمكانية إرفاق الملفات ومتابعة حالة الطلب فوراً.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 font-bold rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {uploadSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold rounded-2xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Two Matching Columns (خانتين متقابلتين) */}
        <div className="space-y-4">
          <div className="text-start">
            <h2 className="text-xl font-black text-slate-900">اختر الخدمة المطلوبة</h2>
            <p className="text-xs text-slate-500">اختر مسابقة من الخانة الأولى، أو وثيقة من الخانة الثانية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* COLUMN 1: التسجيل في المسابقات */}
            <div className={`rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 bg-white ${
              categoryType === 'competitions'
                ? 'border-teal-600 ring-4 ring-teal-500/10 shadow-lg'
                : 'border-slate-200 opacity-90 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">الخانة الأولى: التسجيل في المسابقات</h3>
                  <span className="text-xs text-teal-700 font-semibold">13 خياراً متاحاً للتسجيل</span>
                </div>
              </div>

              <div className="space-y-2">
                {COMPETITION_OPTIONS.map((opt) => {
                  const isSelected = categoryType === 'competitions' && selectedItemId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => {
                        setCategoryType('competitions');
                        setSelectedItemId(opt.id);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-start flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold shadow-xs'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceChoice"
                        checked={isSelected}
                        onChange={() => {
                          setCategoryType('competitions');
                          setSelectedItemId(opt.id);
                        }}
                        className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: استخراج الملفات */}
            <div className={`rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 bg-white ${
              categoryType === 'documents'
                ? 'border-teal-600 ring-4 ring-teal-500/10 shadow-lg'
                : 'border-slate-200 opacity-90 hover:border-slate-300'
            }`}>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FolderDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">الخانة الثانية: استخراج الملفات</h3>
                  <span className="text-xs text-emerald-700 font-semibold">سحب واستخراج الوثائق والاستمارات</span>
                </div>
              </div>

              <div className="space-y-2">
                {EXTRACTION_OPTIONS.map((opt) => {
                  const isSelected = categoryType === 'documents' && selectedItemId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => {
                        setCategoryType('documents');
                        setSelectedItemId(opt.id);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-start flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold shadow-xs'
                          : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceChoice"
                        checked={isSelected}
                        onChange={() => {
                          setCategoryType('documents');
                          setSelectedItemId(opt.id);
                        }}
                        className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Custom Name Input when "Other" or "Forms" is selected */}
        {isCustomInputRequired && (
          <div className="p-5 bg-teal-50 border-2 border-teal-300 rounded-3xl space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-black text-teal-900">
              {selectedItemId === 'comp_other'
                ? 'اكتب اسم المسابقة المطلوبة بالتحديد *'
                : selectedItemId === 'ext_forms'
                ? 'اكتب اسم الاستمارة المطلوبة *'
                : 'اكتب اسم الوثيقة المراد استخراجها *'}
            </label>
            <input
              type="text"
              required
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              placeholder={
                selectedItemId === 'comp_other'
                  ? 'مثال: مسابقة الجمارك، سوناطراك، مجمع سونلغاز...'
                  : selectedItemId === 'ext_forms'
                  ? 'مثال: استمارة طلب بطاقة الشفاء، استمارة منحة البطالة، استمارة السكن...'
                  : 'مثال: بطاقة الإقامة، شهادة العمل، كشف الراتب...'
              }
              className="w-full px-4 py-3 bg-white border border-teal-300 rounded-2xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}

        {/* Section 2: File Upload with True Permanent Storage & Reliable Downloads */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                <span>إرفاق الملفات والصور (اختياري / حسب شروط الخدمة)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك رفع بطاقة التعريف، شهادة الإقامة، الدبلوم، الاستمارة المكتوبة، أو صور المستندات.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
              PDF, DOC, DOCX, JPG, PNG (حتى 25 ميغابايت)
            </span>
          </div>

          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 rounded-3xl p-6 sm:p-8 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  انقر هنا لاختيار الملفات أو اسحبها وأفلتها مباشرة
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  يدعم PDF، Word، والصور (حتى 100 ميغابايت لكل ملف)، وتُحفظ الملفات بصيغتها الأصلية تماماً لتنزيلها وقراءتها.
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2 p-4 bg-teal-50 rounded-2xl border border-teal-200">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span>جاري رفع ومعالجة الملفات بأمان...</span>
                <span>{uploadProgress || 0}%</span>
              </div>
              <div className="w-full bg-teal-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress || 10}%` }}
                />
              </div>
            </div>
          )}

          {/* List of Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-slate-700">الملفات المرفقة الجاهزة ({attachedFiles.length}):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-white text-teal-700 rounded-xl border border-slate-200 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="p-1.5 hover:bg-white text-slate-600 hover:text-teal-700 rounded-lg transition-colors cursor-pointer"
                        title="معاينة الملف"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerFileDownload(file.downloadUrl, file.originalName)}
                        className="p-1.5 hover:bg-white text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        title="تحميل الملف الأصلي"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="حذف الملف"
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

        {/* Section 3: Customer Details & Form Inputs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            بيانات التواصل والتأكيد
          </h3>

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
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>البريد الإلكتروني للزبون (إجباري لإرسال إشعار السحب والملف) *</span>
              <span className="text-[11px] text-teal-700 font-semibold font-mono">حقل إجباري</span>
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="votre.email@gmail.com"
              dir="ltr"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-start font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">يُشترط بريد إلكتروني صحيح ومفعل لإعلامك فور جهوزية المستخرج أو استلام النسخة الإلكترونية.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span>رقم التعريف الوطني / رقم التسجيل / المعرف أو شهادة البكالوريا (إن وجد)</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="رقم بطاقة التعريف، رقم التسجيل في البكالوريا، أو رقم العقد..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('orderNotes')}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي تفاصيل أو متطلبات خاصة (مثال: الطور الدراسي، الولاية، التخصص، عدد النسخ الورقية المطلوبة...)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Transparency & Disclaimer Notice */}
          <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-2 text-xs text-teal-950">
            <div className="flex items-center gap-2 font-bold text-teal-800">
              <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0" />
              <span>تنبيه وإخلاء مسؤولية حول التسجيل والمنصات الرسمية:</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              تقدم مكتبة 113 خدمة مساعدة المواطنين والتلاميذ والطلبة في إدخال بياناتهم ومتابعة التسجيلات وسحب الاستمارات عبر المنصات الرقمية الوطنية الرسمية. تتم جميع المعاملات في إطار الدعم المكتبي والمساعدة التقنية المعتادة، مع الحفاظ الكامل على سرية وخصوصية الوثائق والملفات الشخصية للزبائن دون ادعاء أي صلة حكومية رسمية.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? t('loading') : 'إرسال طلب التسجيل / استخراج الوثائق'}</span>
          </button>
        </div>

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

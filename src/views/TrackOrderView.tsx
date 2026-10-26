import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  Printer,
  FileText,
  ShoppingBag,
  Eye,
  Download
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { findByReferenceCode } from '../services/dbService';
import { Order, PrintRequest, ResearchRequest, OrderStatus, UploadedFileInfo } from '../types';
import { formatFileSize, triggerFileDownload } from '../services/storageService';
import { FilePreviewModal } from '../components/FilePreviewModal';

export const TrackOrderView: React.FC = () => {
  const { t } = useLanguage();
  const [refInput, setRefInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{
    type: 'order' | 'print' | 'research';
    data: Order | PrintRequest | ResearchRequest;
  } | null>(null);
  const [searched, setSearched] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const res = await findByReferenceCode(refInput.trim());
      setResult(res);
    } catch (err) {
      console.error('Search error:', err);
      setResult(null);
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black">جديد قيد المراجعة</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">قيد التجهيز والطباعة</span>;
      case 'ready':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">جاهز للاستلام بالمكتبة</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-black">مكتمل ومسلّم</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black">ملغى</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-lg text-center">
        <h1 className="text-2xl sm:text-3xl font-black mb-2">{t('trackTitle')}</h1>
        <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
          {t('trackDesc')}
        </p>

        {/* Input bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
          <input
            type="text"
            required
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="ORD-12345 أو PRN-12345"
            dir="ltr"
            className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder-slate-400 font-mono text-sm focus:outline-none uppercase"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{searching ? t('loading') : t('checkStatus')}</span>
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && !result && !searching && (
        <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-base">{t('orderNotFound')}</h3>
          <p className="text-xs text-slate-500">
            تأكد من كتابة الرقم بشكل صحيح مع الشرطة والبادئة (مثلاً: PRN-58190 أو ORD-92182).
          </p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                {result.type === 'order' && <ShoppingBag className="w-6 h-6" />}
                {result.type === 'print' && <Printer className="w-6 h-6" />}
                {result.type === 'research' && <FileText className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  {result.type === 'order' ? 'طلب مشتريات من المتجر' : result.type === 'print' ? 'طلب طباعة ونسخ' : 'طلب مذكرة وبحث تخرج'}
                </span>
                <h3 className="font-mono font-black text-slate-900 text-xl">
                  {result.data.referenceCode}
                </h3>
              </div>
            </div>

            <div>{getStatusBadge(result.data.status)}</div>
          </div>

          {/* Timeline Step Indicator */}
          <div className="py-4">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl ${['new', 'processing', 'ready', 'completed'].includes(result.data.status) ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                1. استلام الطلب
              </div>
              <div className={`p-2.5 rounded-xl ${['processing', 'ready', 'completed'].includes(result.data.status) ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                2. قيد التجهيز
              </div>
              <div className={`p-2.5 rounded-xl ${['ready', 'completed'].includes(result.data.status) ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                3. جاهز للاستلام
              </div>
              <div className={`p-2.5 rounded-xl ${result.data.status === 'completed' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                4. مكتمل ومسلّم
              </div>
            </div>
          </div>

          {/* Type-Specific Details */}
          {result.type === 'order' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">عناصر الطلب:</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2">
                {(result.data as Order).items.map((item, i) => (
                  <div key={i} className="py-2.5 px-3 flex items-center justify-between text-xs sm:text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-black text-slate-800">{item.price * item.quantity} {t('currency')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-4 rounded-xl">
                <span>المجموع الإجمالي:</span>
                <span className="text-emerald-700 font-black text-base">{(result.data as Order).total} {t('currency')}</span>
              </div>
            </div>
          )}

          {result.type === 'print' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400 block">عدد النسخ:</span>
                  <span className="font-bold text-slate-800">{(result.data as PrintRequest).copies}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">نوع الطباعة:</span>
                  <span className="font-bold text-slate-800">{(result.data as PrintRequest).colorMode === 'bw' ? 'أبيض وأسود' : 'ألوان'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">حجم الورق:</span>
                  <span className="font-bold text-slate-800">{(result.data as PrintRequest).paperSize}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">الوجهين:</span>
                  <span className="font-bold text-slate-800">{(result.data as PrintRequest).sidedness === 'double' ? 'وجهين' : 'وجه واحد'}</span>
                </div>
              </div>

              {(result.data as PrintRequest).calculatedPrice && (
                <div className="flex justify-between items-center bg-emerald-50 text-emerald-900 p-4 rounded-2xl font-bold text-sm">
                  <span>السعر المحدد من الإدارة:</span>
                  <span className="font-black text-base">{(result.data as PrintRequest).calculatedPrice} {t('currency')}</span>
                </div>
              )}

              {/* Files */}
              {(result.data as PrintRequest).files?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">الملفات المرفوعة:</h4>
                  <div className="space-y-2">
                    {(result.data as PrintRequest).files.map((f, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <span className="truncate max-w-[200px] font-medium">{f.originalName}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewFile(f)}
                            className="p-1 hover:bg-slate-200 text-emerald-700 rounded-md"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerFileDownload(f.downloadUrl, f.originalName)}
                            className="p-1 hover:bg-slate-200 text-slate-700 rounded-md"
                            title="تحميل الملف الأصلي"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.type === 'research' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p><span className="text-slate-400">العنوان: </span><span className="font-bold text-slate-800">{(result.data as ResearchRequest).title}</span></p>
                <p><span className="text-slate-400">المستوى والتخصص: </span><span className="font-bold text-slate-800">{(result.data as ResearchRequest).academicLevel} • {(result.data as ResearchRequest).specialty}</span></p>
                {(result.data as ResearchRequest).deadline && (
                  <p><span className="text-slate-400">تاريخ التسليم المطلوب: </span><span className="font-bold text-slate-800">{(result.data as ResearchRequest).deadline}</span></p>
                )}
                {(result.data as ResearchRequest).calculatedPrice && (
                  <p><span className="text-slate-400">السعر المقدر: </span><span className="font-black text-emerald-700">{(result.data as ResearchRequest).calculatedPrice} {t('currency')}</span></p>
                )}
              </div>

              {/* Research Files */}
              {(result.data as ResearchRequest).files?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-2">الملفات المرفقة بالمذكرة:</h4>
                  <div className="space-y-2">
                    {(result.data as ResearchRequest).files.map((f, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <span className="truncate max-w-[200px] font-medium">{f.originalName}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewFile(f)}
                            className="p-1 hover:bg-slate-200 text-emerald-700 rounded-md"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerFileDownload(f.downloadUrl, f.originalName)}
                            className="p-1 hover:bg-slate-200 text-slate-700 rounded-md"
                            title="تحميل الملف الأصلي"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date info */}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            تاريخ التسجيل: {new Date(result.data.createdAt).toLocaleString()}
          </div>

        </div>
      )}

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Printer,
  X,
  Download,
  ExternalLink,
  Check,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Settings2,
  Maximize2
} from 'lucide-react';
import { UploadedFileInfo } from '../types';

export interface DirectPrintModalProps {
  file: UploadedFileInfo;
  requestInfo: {
    referenceCode: string;
    customerName: string;
    customerPhone?: string;
    initialCopies?: number;
    initialColorMode?: 'bw' | 'color';
    initialPaperSize?: 'A4' | 'A3' | string;
    initialSidedness?: 'single' | 'double' | string;
    initialPageRange?: string;
    notes?: string;
  };
  onClose: () => void;
  onStatusUpdate?: (newStatus: 'ready' | 'completed') => Promise<void> | void;
}

export const DirectPrintModal: React.FC<DirectPrintModalProps> = ({
  file,
  requestInfo,
  onClose,
  onStatusUpdate
}) => {
  const [copies, setCopies] = useState<number>(requestInfo.initialCopies || 1);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>(
    requestInfo.initialPaperSize === 'A3' ? 'A3' : 'A4'
  );
  const [colorMode, setColorMode] = useState<'bw' | 'color'>(
    requestInfo.initialColorMode === 'color' ? 'color' : 'bw'
  );
  const [sidedness, setSidedness] = useState<'single' | 'double'>(
    requestInfo.initialSidedness === 'double' ? 'double' : 'single'
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageRange, setPageRange] = useState<string>(requestInfo.initialPageRange || 'الكل');
  
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'printed'>('idle');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState<string | null>(null);

  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const isImage = file.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|svg)$/i.test(file.originalName);
  const isPdf = file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.originalName);
  const isWord = /\.docx?$/i.test(file.originalName) || file.mimeType.includes('word') || file.mimeType.includes('document');

  // Trigger standard browser print flow
  const handleExecutePrint = () => {
    setPrintStatus('printing');

    if (isImage) {
      // Print image via dynamic printable iframe
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html dir="rtl">
            <head>
              <title>${requestInfo.referenceCode} - ${file.originalName}</title>
              <style>
                @page {
                  size: ${paperSize} ${orientation};
                  margin: 8mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: white;
                  min-height: 100vh;
                  ${colorMode === 'bw' ? 'filter: grayscale(100%);' : ''}
                }
                img {
                  max-width: 100%;
                  max-height: 98vh;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${file.downloadUrl}" alt="وثيقة للطباعة" onload="setTimeout(function(){ window.focus(); window.print(); }, 200);" />
            </body>
          </html>
        `);
        iframeDoc.close();
      }

      setTimeout(() => {
        setPrintStatus('printed');
        try {
          document.body.removeChild(printIframe);
        } catch {
          // already removed or ignored
        }
      }, 3000);

    } else if (isPdf) {
      // PDF printing
      const printWindow = window.open(file.downloadUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        // Give time for PDF viewer to mount then trigger print
        setTimeout(() => {
          try {
            printWindow.print();
          } catch {
            // Some browsers handle print in their internal PDF UI
          }
        }, 1200);
      }
      setTimeout(() => setPrintStatus('printed'), 1500);

    } else {
      // Word / other documents
      // Open file in new tab or download for printing
      window.open(file.downloadUrl, '_blank');
      setTimeout(() => setPrintStatus('printed'), 1500);
    }
  };

  const handleApplyStatusChange = async (newStatus: 'ready' | 'completed') => {
    if (!onStatusUpdate) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(newStatus);
      setStatusUpdatedSuccess(newStatus === 'ready' ? 'جاهز للاستلام' : 'مكتمل');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs font-['Cairo',sans-serif]"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  الطباعة المباشرة والتحكم بالطابعة
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {requestInfo.referenceCode}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                الزبون: {requestInfo.customerName} {requestInfo.customerPhone && `• ${requestInfo.customerPhone}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                {isImage && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                {isPdf && <FileText className="w-4 h-4 text-rose-600" />}
                {isWord && <FileText className="w-4 h-4 text-blue-600" />}
                <span className="truncate max-w-xs">{file.originalName}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>فتح بحجم كامل</span>
                </a>
                <a
                  href={file.downloadUrl}
                  download={file.originalName}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
              </div>
            </div>

            {/* Visual Preview Box */}
            <div className="flex-1 min-h-[320px] max-h-[460px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative">
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img
                    src={file.downloadUrl}
                    alt={file.originalName}
                    className={`max-h-[420px] max-w-full object-contain rounded-lg shadow-xs transition-all ${
                      colorMode === 'bw' ? 'grayscale' : ''
                    } ${orientation === 'landscape' ? 'rotate-0' : ''}`}
                  />
                </div>
              ) : isPdf ? (
                <iframe
                  ref={printFrameRef}
                  src={`${file.downloadUrl}#toolbar=1&navpanes=0`}
                  title="PDF Preview"
                  className="w-full h-full min-h-[380px] rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="p-8 text-center space-y-4 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base mb-1">{file.originalName}</h3>
                    <p className="text-xs text-slate-500">
                      مستند وورد / ملف مكتبي ({file.mimeType})
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-start leading-relaxed font-medium">
                    💡 يمكنك الضغط على «بدء الطباعة الآن» لفتح الملف وإرساله مباشرة إلى نافذة الطباعة في نظام التشغيل.
                  </div>
                </div>
              )}
            </div>

            {requestInfo.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-700 block mb-1">ملاحظات الزبون:</span>
                <p className="text-slate-600">{requestInfo.notes}</p>
              </div>
            )}
          </div>

          {/* Print Controls Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Settings2 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-sm">خيارات ومعايير الطباعة</h3>
              </div>

              {/* Number of Copies */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد النسخ المطلوبة:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center font-black text-sm text-slate-900 py-1.5 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">نسخة</span>
                </div>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">حجم الورق:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperSize('A4')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      paperSize === 'A4'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    A4 (ورق قياسي)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperSize('A3')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      paperSize === 'A3'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    A3 (ورق كبير)
                  </button>
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نمط الألوان:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('bw')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      colorMode === 'bw'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    أبيض وأسود (N&B)
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('color')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      colorMode === 'color'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ألوان كاملة (Couleur)
                  </button>
                </div>
              </div>

              {/* Sidedness */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الوجهين:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSidedness('single')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      sidedness === 'single'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    وجه واحد (Recto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidedness('double')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      sidedness === 'double'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    وجهين (Recto-Verso)
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اتجاه الورقة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      orientation === 'portrait'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    طولي (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      orientation === 'landscape'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    عرضي (Landscape)
                  </button>
                </div>
              </div>

              {/* Page Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نطاق الصفحات:</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="مثال: الكل أو 1-10 أو 3, 5, 8"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

            </div>

            {/* Print Trigger Button */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleExecutePrint}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>🖨️ بدء الطباعة المباشرة الآن ({copies} نسخ)</span>
              </button>

              {/* Post Print Status Prompt */}
              {printStatus === 'printed' && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم إرسال أمر الطباعة للمتصفح. هل نجحت العملية؟</span>
                  </div>

                  {statusUpdatedSuccess ? (
                    <div className="p-2 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center">
                      ✓ تم تحديث حالة الطلب إلى: {statusUpdatedSuccess}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleApplyStatusChange('ready')}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        ✓ جاهز للاستلام
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleApplyStatusChange('completed')}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        ✓ مكتمل ومسلّم
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-700 font-bold">{file.originalName}</span>
            <span>•</span>
            <span>{Math.round(file.size / 1024)} كيلوبايت</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

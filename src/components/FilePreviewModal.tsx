import React from 'react';
import { X, Download, FileText, ExternalLink, Image as ImageIcon, Eye } from 'lucide-react';
import { UploadedFileInfo } from '../types';
import { formatFileSize, triggerFileDownload } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';

interface FilePreviewModalProps {
  file: UploadedFileInfo | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const { t } = useLanguage();

  if (!file) return null;

  const isPdf = file.mimeType.includes('pdf') || file.originalName.toLowerCase().endsWith('.pdf');
  const isImage = file.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.originalName);
  const isWord = file.mimeType.includes('word') || /\.(doc|docx)$/i.test(file.originalName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate" title={file.originalName}>
                {file.originalName}
              </h3>
              <p className="text-xs text-slate-500">
                {formatFileSize(file.size)} • {file.mimeType || 'Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerFileDownload(file.downloadUrl, file.originalName)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              title={t('downloadOriginal')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('download')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <div className="max-w-full max-h-[70vh] flex items-center justify-center">
              <img
                src={file.downloadUrl}
                alt={file.originalName}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md border border-slate-200 bg-white"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-slate-300 shadow-inner bg-white">
              <iframe
                src={file.downloadUrl}
                title={file.originalName}
                className="w-full h-full border-none"
              />
            </div>
          ) : isWord ? (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-2">مستند Word أصلي محفوظ بأمان</h4>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                ملفات Word (.doc/.docx) تُحفظ بصيغتها الأصلية تماماً لضمان عدم تغيير التنسيق أو الخطوط أو الجداول، ويمكن تنزيلها وفتحها مباشرة على حاسوبك أو هاتفك.
              </p>
              <button
                type="button"
                onClick={() => triggerFileDownload(file.downloadUrl, file.originalName)}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                تحميل الملف الأصلي ({formatFileSize(file.size)})
              </button>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base mb-1">{file.originalName}</h4>
              <p className="text-sm text-slate-500 mb-4">{formatFileSize(file.size)}</p>
              <button
                type="button"
                onClick={() => triggerFileDownload(file.downloadUrl, file.originalName)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t('downloadOriginal')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : ''}</span>
          <span className="font-mono">{file.mimeType}</span>
        </div>
      </div>
    </div>
  );
};

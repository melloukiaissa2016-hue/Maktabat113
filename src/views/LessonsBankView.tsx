import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Download,
  FileText,
  Eye,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Lesson, UploadedFileInfo } from '../types';
import { formatFileSize } from '../services/storageService';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface LessonsBankViewProps {
  lessons: Lesson[];
}

export const LessonsBankView: React.FC<LessonsBankViewProps> = ({ lessons }) => {
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  const levels = [
    { id: 'all', label: 'كل الأطوار' },
    { id: 'primary', label: t('levelPrimary') },
    { id: 'middle', label: t('levelMiddle') },
    { id: 'high', label: t('levelHigh') },
    { id: 'university', label: t('levelUniversity') },
  ];

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      if (selectedLevel !== 'all' && l.level !== selectedLevel) return false;
      if (selectedSemester !== 'all' && l.semester !== selectedSemester) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchSubj = l.subject.toLowerCase().includes(q);
        const matchGrade = l.grade?.toLowerCase().includes(q);
        if (!matchTitle && !matchSubj && !matchGrade) return false;
      }
      return true;
    });
  }, [lessons, selectedLevel, selectedSemester, searchQuery]);

  const handlePreview = (lesson: Lesson) => {
    setPreviewFile({
      originalName: lesson.fileName || lesson.title,
      size: lesson.fileSize || 1024 * 1024,
      mimeType: lesson.fileType || 'application/pdf',
      downloadUrl: lesson.fileUrl,
      uploadedAt: lesson.createdAt
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-pink-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-9 h-9 text-rose-300" />
          <h1 className="text-2xl sm:text-3xl font-black">{t('lessonsTitle')}</h1>
        </div>
        <p className="text-rose-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          {t('lessonsDesc')}
        </p>
      </div>

      {/* Filters and search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مادة، درس، أو سنة دراسية..."
              className="w-full ps-11 pe-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
            >
              <option value="all">كل الفصول</option>
              <option value="1">{t('sem1')}</option>
              <option value="2">{t('sem2')}</option>
              <option value="3">{t('sem3')}</option>
            </select>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                selectedLevel === lvl.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg mb-1">لا توجد دروس متوفرة في هذا التخصص حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            يتم رفع وتحديث بنك الدروس والفروض الدورية أسبوعياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                    {lesson.subject}
                  </span>
                  {lesson.grade && (
                    <span className="text-xs text-slate-500 font-medium">
                      {lesson.grade}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">
                  {lesson.title}
                </h3>

                {lesson.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {lesson.fileSize ? formatFileSize(lesson.fileSize) : 'ملف PDF'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(lesson)}
                    className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                    title={t('view')}
                  >
                    <Eye className="w-4 h-4 text-rose-600" />
                  </button>
                  <a
                    href={lesson.fileUrl}
                    download={lesson.fileName || 'lesson.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('download')}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
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

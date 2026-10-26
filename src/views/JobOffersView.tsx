import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  Building,
  ExternalLink,
  Download,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JobOffer } from '../types';

interface JobOffersViewProps {
  jobs: JobOffer[];
}

export const JobOffersView: React.FC<JobOffersViewProps> = ({ jobs }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [activeJobModal, setActiveJobModal] = useState<JobOffer | null>(null);

  const wilayas = useMemo(() => {
    const list = Array.from(new Set(jobs.map((j) => j.wilaya).filter(Boolean)));
    return ['all', ...list];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (j.status === 'archived') return false;
      if (selectedWilaya !== 'all' && j.wilaya !== selectedWilaya) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = j.title.toLowerCase().includes(q);
        const matchOrg = j.organization.toLowerCase().includes(q);
        const matchSpec = j.specialty?.toLowerCase().includes(q);
        const matchDesc = j.description.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchSpec && !matchDesc) return false;
      }
      return true;
    });
  }, [jobs, selectedWilaya, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-9 h-9 text-purple-300" />
          <h1 className="text-2xl sm:text-3xl font-black">{t('jobsTitle')}</h1>
        </div>
        <p className="text-purple-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          {t('jobsDesc')}
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منصب، مؤسسة، أو تخصص..."
            className="w-full ps-11 pe-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
          >
            <option value="all">{t('filterWilaya')}</option>
            {wilayas.filter((w) => w !== 'all').map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Job Offers */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg mb-1">لا توجد عروض توظيف مطابقة حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            تابع هذه الصفحة بانتظام للاطلاع على أحدث المسابقات والإعلانات الرسمية فور نشرها.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.wilaya}</span>
                    </span>
                    {job.isNew && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[11px] font-black rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{t('newBadge')}</span>
                      </span>
                    )}
                  </div>

                  {job.deadline && (
                    <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{job.deadline}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                  {job.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>{job.organization}</span>
                  {job.position && (
                    <>
                      <span>•</span>
                      <span className="text-purple-700">{job.position}</span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {job.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveJobModal(job)}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                >
                  {t('viewDetails')}
                </button>

                {job.officialLink && (
                  <a
                    href={job.officialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-purple-600 text-xs font-semibold"
                  >
                    <span>{t('applyLink')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveJobModal(null)}
              className="absolute top-5 left-5 rtl:left-5 rtl:right-auto ltr:right-5 ltr:left-auto p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg">
                  {activeJobModal.wilaya}
                </span>
                {activeJobModal.deadline && (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    آخر أجل للتسجيل: {activeJobModal.deadline}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeJobModal.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                المؤسسة المنظمة: {activeJobModal.organization}
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">تفاصيل الإعلان:</h4>
                <p className="whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeJobModal.description}
                </p>
              </div>

              {activeJobModal.requirements && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">الشروط والملف المطلوب:</h4>
                  <p className="whitespace-pre-line bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-amber-900">
                    {activeJobModal.requirements}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {activeJobModal.officialLink && (
                <a
                  href={activeJobModal.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>الانتقال للموقع الرسمي للترشح</span>
                </a>
              )}

              {activeJobModal.attachmentUrl && (
                <a
                  href={activeJobModal.attachmentUrl}
                  target="_blank"
                  download
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف الإعلان الرسمي</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

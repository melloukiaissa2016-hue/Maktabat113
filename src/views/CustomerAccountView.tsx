import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Printer,
  FileText,
  Clock,
  Eye,
  LogOut,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  subscribeCustomerOrders,
  subscribeCustomerPrintRequests,
  subscribeCustomerResearchRequests
} from '../services/dbService';
import { Order, PrintRequest, ResearchRequest, UploadedFileInfo } from '../types';
import { FilePreviewModal } from '../components/FilePreviewModal';

interface CustomerAccountViewProps {
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  onNavigate,
  onOpenAuth
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'orders' | 'prints' | 'research'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [prints, setPrints] = useState<PrintRequest[]>([]);
  const [research, setResearch] = useState<ResearchRequest[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubOrders = subscribeCustomerOrders(currentUser.uid, setOrders);
    const unsubPrints = subscribeCustomerPrintRequests(currentUser.uid, setPrints);
    const unsubResearch = subscribeCustomerResearchRequests(currentUser.uid, setResearch);

    return () => {
      unsubOrders();
      unsubPrints();
      unsubResearch();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">سجل الدخول لعرض حسابك</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          يمكنك تتبع جميع طلباتك السابقة والاطلاع على الملفات ومتابعة حالة التجهيز بسهولة.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
        >
          {t('loginBtn')} / {t('registerBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser.displayName || 'الزبون الكريم'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('navLogout')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>طلبات المتجر ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prints')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'prints'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>طلبات الطباعة ({prints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'research'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>مذكرات التخرج ({research.length})</span>
        </button>
      </div>

      {/* Tab Content: Store Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد طلبات سابقة في المتجر</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-base">{o.referenceCode}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        o.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'ready' ? 'bg-teal-100 text-teal-800' :
                        o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status === 'new' ? 'جديد' : o.status === 'processing' ? 'قيد المعالجة' : o.status === 'ready' ? 'جاهز للاستلام' : o.status === 'completed' ? 'مكتمل' : 'ملغى'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleString()} • {o.items.length} منتج
                    </p>
                  </div>

                  <div className="text-end">
                    <span className="text-lg font-black text-emerald-700">{o.total} {t('currency')}</span>
                    <p className="text-[11px] text-slate-400">
                      {o.deliveryMethod === 'delivery' ? 'توصيل للعنوان' : 'استلام من المكتبة'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Print Requests */}
      {activeTab === 'prints' && (
        <div className="space-y-4">
          {prints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <Printer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد طلبات طباعة سابقة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prints.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-base">{p.referenceCode}</span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {p.copies} نسخ • {p.colorMode === 'bw' ? 'أبيض وأسود' : 'ألوان'} • {p.paperSize}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleString()} • {p.files?.length || 0} ملف
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.files?.[0] && (
                      <button
                        onClick={() => setPreviewFile(p.files[0])}
                        className="p-2 hover:bg-slate-100 text-emerald-700 rounded-xl"
                        title="معاينة الملف"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg">
                      {p.calculatedPrice ? `${p.calculatedPrice} ${t('currency')}` : 'السعر قيد التحديد'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Research */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          {research.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد مذكرات سابقة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {research.map((r) => (
                <div key={r.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-base">{r.referenceCode}</span>
                      <span className="font-bold text-slate-800 text-sm truncate max-w-sm">{r.title}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleString()} • {r.academicLevel} • {r.files?.length || 0} ملف
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.files?.[0] && (
                      <button
                        onClick={() => setPreviewFile(r.files[0])}
                        className="p-2 hover:bg-slate-100 text-blue-700 rounded-xl"
                        title="معاينة الملف"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-lg">
                      {r.status === 'completed' ? 'منتهية ومسلّمة' : 'قيد المراجعة والتنفيذ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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

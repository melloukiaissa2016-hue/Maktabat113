import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  Printer,
  FileText,
  Package,
  Briefcase,
  BookOpen,
  Settings,
  History,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Phone,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Users,
  FolderDown,
  Search,
  Filter,
  LogOut,
  KeyRound,
  Store,
  Layers,
  ArrowUpRight,
  Smartphone,
  Receipt,
  FileCheck2,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  subscribeOrders,
  subscribePrintRequests,
  subscribeResearchRequests,
  subscribeProducts,
  subscribeJobOffers,
  subscribeLessons,
  subscribeAdminLogs,
  subscribeUsers,
  deleteUserRecord,
  updateOrderStatus,
  updatePrintRequest,
  updateResearchRequest,
  saveProduct,
  deleteProduct,
  saveJobOffer,
  deleteJobOffer,
  saveLesson,
  deleteLesson,
  updateSiteSettings,
  logAdminAction,
  subscribeDocumentRequests,
  updateDocumentRequest,
  deleteDocumentRequest,
  subscribeFlexyRequests,
  updateFlexyRequest,
  deleteFlexyRequest,
  subscribeBillPayments,
  updateBillPayment,
  deleteBillPayment,
  subscribeCustomerMessages,
  updateCustomerMessage,
  deleteCustomerMessage,
  subscribeBanners,
  saveBanner,
  deleteBanner
} from '../services/dbService';
import {
  Order,
  PrintRequest,
  ResearchRequest,
  Product,
  JobOffer,
  Lesson,
  AdminLog,
  SiteSettings,
  OrderStatus,
  FlexyStatus,
  UploadedFileInfo,
  AppUser,
  ManagedFileItem,
  DocumentExtractionRequest,
  FlexyRequest,
  BillPaymentRequest,
  CustomerMessage,
  BannerItem
} from '../types';
import { formatFileSize, triggerFileDownload, validateFile, uploadFile } from '../services/storageService';
import { FilePreviewModal } from '../components/FilePreviewModal';
import { DirectPrintModal } from '../components/DirectPrintModal';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface AdminDashboardViewProps {
  siteSettings: SiteSettings;
  onRefreshSettings: () => void;
  onNavigate: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  siteSettings,
  onRefreshSettings,
  onNavigate
}) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'customers'
    | 'orders'
    | 'products'
    | 'banners'
    | 'prints'
    | 'research'
    | 'documents'
    | 'flexy'
    | 'bills'
    | 'files'
    | 'jobs'
    | 'lessons'
    | 'messages'
    | 'settings'
    | 'logs'
  >('overview');

  // Real data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [prints, setPrints] = useState<PrintRequest[]>([]);
  const [research, setResearch] = useState<ResearchRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [customers, setCustomers] = useState<AppUser[]>([]);
  const [documents, setDocuments] = useState<DocumentExtractionRequest[]>([]);
  const [flexyList, setFlexyList] = useState<FlexyRequest[]>([]);
  const [billsList, setBillsList] = useState<BillPaymentRequest[]>([]);
  const [messagesList, setMessagesList] = useState<CustomerMessage[]>([]);
  const [bannersList, setBannersList] = useState<BannerItem[]>([]);

  // Modals & UI states
  const [previewFile, setPreviewFile] = useState<UploadedFileInfo | null>(null);
  const [directPrintTarget, setDirectPrintTarget] = useState<{
    file: UploadedFileInfo;
    requestInfo: any;
    reqId: string;
    type: 'print' | 'research';
  } | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingJob, setEditingJob] = useState<Partial<JobOffer> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<BannerItem> | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters for Files tab
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'pdf' | 'word' | 'image'>('all');

  // Filters for Customers tab
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Filters for Flexy tab
  const [flexyOperatorFilter, setFlexyOperatorFilter] = useState<string>('all');
  const [flexySearchQuery, setFlexySearchQuery] = useState('');

  // Filters for Bills tab
  const [billsProviderFilter, setBillsProviderFilter] = useState<string>('all');
  const [billsSearchQuery, setBillsSearchQuery] = useState('');

  // Filters for Documents tab
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Filters for Messages tab
  const [messageSearchQuery, setMessageSearchQuery] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (!isAdmin) return;

    const uOrders = subscribeOrders(setOrders);
    const uPrints = subscribePrintRequests(setPrints);
    const uResearch = subscribeResearchRequests(setResearch);
    const uProducts = subscribeProducts(setProducts);
    const uJobs = subscribeJobOffers(setJobs);
    const uLessons = subscribeLessons(setLessons);
    const uLogs = subscribeAdminLogs(setLogs);
    const uUsers = subscribeUsers(setCustomers);
    const uDocs = subscribeDocumentRequests(setDocuments);
    const uFlexy = subscribeFlexyRequests(setFlexyList);
    const uBills = subscribeBillPayments(setBillsList);
    const uMsgs = subscribeCustomerMessages(setMessagesList);
    const uBanners = subscribeBanners(setBannersList);

    return () => {
      uOrders();
      uPrints();
      uResearch();
      uProducts();
      uJobs();
      uLessons();
      uLogs();
      uUsers();
      uDocs();
      uFlexy();
      uBills();
      uMsgs();
      uBanners();
    };
  }, [isAdmin]);

  const showSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // CSV Exporter helper
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Aggregate all uploaded files across print & research
  const allManagedFiles: ManagedFileItem[] = useMemo(() => {
    const list: ManagedFileItem[] = [];

    // Print requests files
    prints.forEach((p) => {
      p.files?.forEach((f) => {
        list.push({
          file: f,
          sourceType: 'print',
          referenceCode: p.referenceCode,
          customerName: p.customerName,
          customerPhone: p.customerPhone,
          orderStatus: p.status,
          requestId: p.id,
          notes: p.notes
        });
      });
    });

    // Research requests files
    research.forEach((r) => {
      r.files?.forEach((f) => {
        list.push({
          file: f,
          sourceType: 'research',
          referenceCode: r.referenceCode,
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          orderStatus: r.status,
          requestId: r.id,
          notes: r.title
        });
      });
    });

    // Bill payments attached files
    billsList.forEach((b) => {
      if (b.billFile) {
        list.push({
          file: b.billFile,
          sourceType: 'bill',
          referenceCode: b.referenceCode,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          orderStatus: b.status,
          requestId: b.id,
          notes: `فاتورة: ${b.billType} - مرجع: ${b.billReference}`
        });
      }
    });

    // Document extraction attached files
    documents.forEach((d) => {
      d.attachedFiles?.forEach((f) => {
        list.push({
          file: f,
          sourceType: 'document',
          referenceCode: d.referenceCode,
          customerName: d.customerName,
          customerPhone: d.customerPhone,
          orderStatus: d.status,
          requestId: d.id,
          notes: `مستند مرفق: ${d.docCategory}`
        });
      });
      d.resultFiles?.forEach((f) => {
        list.push({
          file: f,
          sourceType: 'document',
          referenceCode: d.referenceCode,
          customerName: d.customerName,
          customerPhone: d.customerPhone,
          orderStatus: d.status,
          requestId: d.id,
          notes: `مستخرج رسمي منجز: ${d.docCategory}`
        });
      });
    });

    return list.sort((a, b) => new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime());
  }, [prints, research, billsList, documents]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return allManagedFiles.filter((item) => {
      // Type filter
      const mime = item.file.mimeType.toLowerCase();
      const name = item.file.originalName.toLowerCase();
      if (fileTypeFilter === 'pdf') {
        if (!mime.includes('pdf') && !name.endsWith('.pdf')) return false;
      } else if (fileTypeFilter === 'word') {
        if (!mime.includes('word') && !name.endsWith('.doc') && !name.endsWith('.docx')) return false;
      } else if (fileTypeFilter === 'image') {
        if (!mime.startsWith('image/') && !/\.(jpg|jpeg|png|webp)$/i.test(name)) return false;
      }

      // Search query
      if (fileSearchQuery.trim()) {
        const q = fileSearchQuery.toLowerCase();
        const matchName = name.includes(q);
        const matchCode = item.referenceCode.toLowerCase().includes(q);
        const matchCustomer = item.customerName.toLowerCase().includes(q) || item.customerPhone.includes(q);
        if (!matchName && !matchCode && !matchCustomer) return false;
      }

      return true;
    });
  }, [allManagedFiles, fileTypeFilter, fileSearchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (customerSearchQuery.trim()) {
        const q = customerSearchQuery.toLowerCase();
        const matchName = c.displayName?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchPhone = c.phone?.includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [customers, customerSearchQuery]);

  // Security guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">منطقة إدارية سرية ومحمية</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t('unauthorizedAdmin')}. هذه اللوحة مخصصة حصراً لمالك المنصة وإدارة مكتبة 113.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('admin-login')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            الانتقال لصفحة تسجيل الدخول الإداري
          </button>
        </div>
      </div>
    );
  }

  // Analytics
  const totalSalesEstimated = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('adminTitle')}</h1>
              <span className="text-[11px] px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                لوحة سرية معتمدة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              المشرف: {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actionSuccess && (
            <div className="p-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
          )}

          <button
            onClick={async () => {
              if (currentUser?.email) {
                await sendPasswordResetEmail(auth, currentUser.email);
                showSuccess('تم إرسال رابط تغيير كلمة المرور إلى بريدك');
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
            title="تغيير كلمة مرور المدير"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>تغيير كلمة المرور</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>عرض المتجر</span>
          </button>

          <button
            onClick={async () => {
              await logAdminAction('ADMIN_LOGOUT', 'Admin logged out from dashboard', currentUser!.email!);
              await logout();
              onNavigate('admin-login');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('navLogout')}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none text-xs sm:text-sm">
        {[
          { id: 'overview', label: '1. ' + t('tabOverview'), icon: TrendingUp },
          { id: 'customers', label: `2. الزبائن (${customers.length})`, icon: Users },
          { id: 'orders', label: `3. ${t('tabOrders')} (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `4. ${t('tabProducts')} (${products.length})`, icon: Package },
          { id: 'banners', label: `5. الصور والبنرات (${bannersList.length})`, icon: ImageIcon },
          { id: 'prints', label: `6. ${t('tabPrint')} (${prints.length})`, icon: Printer },
          { id: 'research', label: `7. ${t('tabResearch')} (${research.length})`, icon: FileText },
          { id: 'documents', label: `8. المسابقات والوثائق (${documents.length})`, icon: FileCheck2 },
          { id: 'flexy', label: `9. فليكسي (${flexyList.length})`, icon: Smartphone },
          { id: 'bills', label: `10. الفواتير (${billsList.length})`, icon: Receipt },
          { id: 'files', label: `11. مركز الملفات (${allManagedFiles.length})`, icon: FolderDown },
          { id: 'jobs', label: `12. ${t('tabJobs')} (${jobs.length})`, icon: Briefcase },
          { id: 'lessons', label: `13. ${t('tabLessons')} (${lessons.length})`, icon: BookOpen },
          { id: 'messages', label: `14. الرسائل (${messagesList.length})`, icon: MessageSquare },
          { id: 'settings', label: `15. ${t('tabSettings')}`, icon: Settings },
          { id: 'logs', label: t('tabLogs'), icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 text-emerald-500" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">{t('totalSales')}</span>
              <p className="text-2xl font-black text-slate-900">{totalSalesEstimated} {t('currency')}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">من طلبات المتجر المؤكدة</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">{t('totalOrdersCount')}</span>
              <p className="text-2xl font-black text-slate-900">{orders.length}</p>
              <span className="text-[11px] text-amber-600 font-semibold mt-2 block">
                {orders.filter((o) => o.status === 'new').length} طلب جديد
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">{t('totalPrintCount')}</span>
              <p className="text-2xl font-black text-slate-900">{prints.length}</p>
              <span className="text-[11px] text-blue-600 font-semibold mt-2 block">
                {prints.filter((p) => p.status === 'new').length} قيد الانتظار
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">الملفات الأصلية المحفوظة</span>
              <p className="text-2xl font-black text-slate-900">{allManagedFiles.length}</p>
              <span className="text-[11px] text-purple-600 font-semibold mt-2 block">
                جاهزة للمعاينة والتنزيل
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-900 text-lg">إجراءات سريعة</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setEditingProduct({}); setActiveTab('products'); }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addNewProduct')}</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <FolderDown className="w-4 h-4 text-emerald-400" />
                <span>معاينة ملفات الزبائن</span>
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span>إدارة حسابات الزبائن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">طلبات المتجر الواردة</h2>
            <button
              onClick={() => {
                const headers = ['رقم الطلب', 'اسم الزبون', 'الهاتف', 'طريقة الاستلام', 'المجموع', 'الحالة', 'التاريخ'];
                const rows = orders.map((o) => [
                  o.referenceCode,
                  o.customerName,
                  o.customerPhone,
                  o.deliveryMethod === 'delivery' ? 'توصيل' : 'استلام',
                  o.total,
                  o.status,
                  o.createdAt
                ]);
                exportToCsv('Maktaba113_Orders', headers, rows);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t('exportCsv')}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-4 text-start">المرجع</th>
                    <th className="p-4 text-start">الزبون</th>
                    <th className="p-4 text-start">المنتجات</th>
                    <th className="p-4 text-start">طريقة الاستلام</th>
                    <th className="p-4 text-start">المجموع</th>
                    <th className="p-4 text-start">الحالة</th>
                    <th className="p-4 text-start">تحديث الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-emerald-700">{o.referenceCode}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{o.customerName}</p>
                        <p className="text-xs text-slate-500 font-mono" dir="ltr">{o.customerPhone}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{o.items?.length || 0} صنف</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {o.items?.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100">
                          {o.deliveryMethod === 'delivery' ? 'توصيل' : 'استلام بالمكتبة'}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">{o.total} {t('currency')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          o.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'ready' ? 'bg-teal-100 text-teal-800' :
                          o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t(`status_${o.status}` as any)}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={async (e) => {
                            const newSt = e.target.value as OrderStatus;
                            await updateOrderStatus(o.id, newSt);
                            await logAdminAction('UPDATE_ORDER_STATUS', `Updated order ${o.referenceCode} to ${newSt}`, currentUser!.email!, o.id);
                            showSuccess(`تم تحديث حالة الطلب ${o.referenceCode}`);
                          }}
                          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="new">جديد</option>
                          <option value="processing">قيد المعالجة</option>
                          <option value="ready">جاهز للاستلام</option>
                          <option value="completed">مكتمل ومسلّم</option>
                          <option value="cancelled">إلغاء الطلب</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINT REQUESTS */}
      {activeTab === 'prints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">طلبات الطباعة والنسخ</h2>
            <button
              onClick={() => {
                const headers = ['رقم الطلب', 'الزبون', 'الهاتف', 'عدد النسخ', 'اللون', 'الحجم', 'الملفات', 'الحالة', 'السعر المحدد'];
                const rows = prints.map((p) => [
                  p.referenceCode,
                  p.customerName,
                  p.customerPhone,
                  p.copies,
                  p.colorMode,
                  p.paperSize,
                  p.files?.map((f) => f.originalName).join(' | ') || '',
                  p.status,
                  p.calculatedPrice || ''
                ]);
                exportToCsv('Maktaba113_Prints', headers, rows);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t('exportCsv')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {prints.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900 text-lg">{p.referenceCode}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                      {p.copies} نسخ • {p.colorMode === 'bw' ? 'أبيض وأسود' : 'ألوان'} • {p.paperSize} • {p.sidedness === 'double' ? 'وجهين' : 'وجه واحد'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={p.status}
                      onChange={async (e) => {
                        const newSt = e.target.value as OrderStatus;
                        await updatePrintRequest(p.id, { status: newSt });
                        await logAdminAction('UPDATE_PRINT_STATUS', `Updated print ${p.referenceCode} to ${newSt}`, currentUser!.email!, p.id);
                        showSuccess(`تم تحديث حالة طلب الطباعة`);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="new">جديد</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="ready">جاهز للاستلام</option>
                      <option value="completed">مكتمل ومسلّم</option>
                      <option value="cancelled">ملغى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block mb-0.5">الزبون:</span>
                    <span className="font-bold text-slate-900">{p.customerName}</span>
                    <span className="block text-slate-500 font-mono" dir="ltr">{p.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">نطاق الصفحات:</span>
                    <span className="font-bold text-slate-800">{p.pageRange || 'الكل'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">ملاحظات الزبون:</span>
                    <span className="text-slate-700">{p.notes || 'لا توجد'}</span>
                  </div>
                </div>

                {/* Uploaded Files */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">الملفات الأصلية ({p.files?.length || 0}):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {p.files?.map((file, fIdx) => (
                      <div key={fIdx} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-slate-800 text-xs truncate" title={file.originalName}>
                              {file.originalName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(file.size)} • {file.mimeType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDirectPrintTarget({
                              file,
                              requestInfo: {
                                referenceCode: p.referenceCode,
                                customerName: p.customerName,
                                customerPhone: p.customerPhone,
                                initialCopies: p.copies,
                                initialColorMode: p.colorMode,
                                initialPaperSize: p.paperSize,
                                initialSidedness: p.sidedness,
                                initialPageRange: p.pageRange,
                                notes: p.notes
                              },
                              reqId: p.id,
                              type: 'print'
                            })}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                            title="الطباعة المباشرة من لوحة الإدارة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>الطباعة المباشرة</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="معاينة الملف"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerFileDownload(file.downloadUrl, file.originalName)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="تحميل الملف الأصلي"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>تحميل</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and Notes */}
                <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t('internalNoteLabel')}
                    </label>
                    <input
                      type="text"
                      defaultValue={p.internalNotes || ''}
                      onBlur={async (e) => {
                        await updatePrintRequest(p.id, { internalNotes: e.target.value });
                        showSuccess('تم حفظ الملاحظات');
                      }}
                      placeholder="سجل عدد الصفحات الفعلي أو الملاحظات..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {t('setPrice')}
                    </label>
                    <input
                      type="number"
                      defaultValue={p.calculatedPrice || ''}
                      onBlur={async (e) => {
                        const price = parseFloat(e.target.value) || 0;
                        await updatePrintRequest(p.id, { calculatedPrice: price });
                        showSuccess('تم تحديد السعر');
                      }}
                      placeholder="السعر (د.ج)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RESEARCH & THESES */}
      {activeTab === 'research' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">طلبات البحوث ومذكرات التخرج</h2>
          <div className="space-y-4">
            {research.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-mono font-black text-slate-900 text-lg">{r.referenceCode}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{r.title}</h3>
                  </div>
                  <select
                    value={r.status}
                    onChange={async (e) => {
                      const newSt = e.target.value as OrderStatus;
                      await updateResearchRequest(r.id, { status: newSt });
                      await logAdminAction('UPDATE_RESEARCH_STATUS', `Updated thesis ${r.referenceCode} to ${newSt}`, currentUser!.email!, r.id);
                      showSuccess('تم تحديث حالة المذكرة');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">جديد</option>
                    <option value="processing">قيد المعالجة</option>
                    <option value="ready">جاهز للاستلام</option>
                    <option value="completed">مكتمل ومسلّم</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block">الطالب / الزبون:</span>
                    <span className="font-bold text-slate-800">{r.customerName}</span>
                    <span className="block text-slate-500 font-mono" dir="ltr">{r.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">المستوى والتخصص:</span>
                    <span className="font-bold text-slate-800">{r.academicLevel} • {r.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تاريخ التسليم المطلوب:</span>
                    <span className="font-bold text-amber-800">{r.deadline || 'غير محدد'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">نوع الخدمة:</span>
                    <span className="font-bold text-slate-800">{r.serviceType}</span>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">ملفات المذكرة الأصلية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {r.files?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <span className="font-medium truncate max-w-xs">{f.originalName}</span>
                        <button
                          type="button"
                          onClick={() => setDirectPrintTarget({
                            file: f,
                            requestInfo: {
                              referenceCode: r.referenceCode,
                              customerName: r.customerName,
                              customerPhone: r.customerPhone,
                              initialCopies: 1,
                              notes: `${r.title} • ${r.academicLevel} • ${r.specialty}`
                            },
                            reqId: r.id,
                            type: 'research'
                          })}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="الطباعة المباشرة للمذكرة"
                        >
                          <Printer className="w-3 h-3" />
                          <span>طباعة مباشرة</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewFile(f)}
                          className="p-1 hover:bg-slate-200 rounded text-blue-600 cursor-pointer"
                          title="معاينة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerFileDownload(f.downloadUrl, f.originalName)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                          title="تحميل الملف الأصلي"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      defaultValue={r.internalNotes || ''}
                      onBlur={async (e) => {
                        await updateResearchRequest(r.id, { internalNotes: e.target.value });
                        showSuccess('تم حفظ الملاحظات');
                      }}
                      placeholder="ملاحظات حول التجليد وعدد النسخ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="w-full sm:w-44">
                    <input
                      type="number"
                      defaultValue={r.calculatedPrice || ''}
                      onBlur={async (e) => {
                        const price = parseFloat(e.target.value) || 0;
                        await updateResearchRequest(r.id, { calculatedPrice: price });
                        showSuccess('تم حفظ السعر');
                      }}
                      placeholder="السعر الإجمالي (د.ج)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPREHENSIVE FILE MANAGEMENT HUB */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">مستودع ومعاينة الملفات الأصلية للزبائن</h2>
              <p className="text-xs text-slate-500">
                جميع المستندات وملفات PDF وWord والصور المرفوعة من الزبائن في طلبات الطباعة والبحوث.
              </p>
            </div>

            <button
              onClick={() => {
                const headers = ['اسم الملف', 'النوع', 'الحجم', 'المرجع', 'الخدمة', 'الزبون', 'الهاتف', 'تاريخ الرفع', 'رابط التنزيل'];
                const rows = allManagedFiles.map((item) => [
                  item.file.originalName,
                  item.file.mimeType,
                  formatFileSize(item.file.size),
                  item.referenceCode,
                  item.sourceType === 'print' ? 'طباعة ونسخ' : 'مذكرة وبحث',
                  item.customerName,
                  item.customerPhone,
                  item.file.uploadedAt,
                  item.file.downloadUrl
                ]);
                exportToCsv('Maktaba113_Customer_Files', headers, rows);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير قائمة الملفات CSV</span>
            </button>
          </div>

          {/* Search & Type Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="ابحث باسم الملف، الزبون، أو رقم المرجع..."
                className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'كل الصيغ' },
                { id: 'pdf', label: 'ملفات PDF' },
                { id: 'word', label: 'مستندات Word' },
                { id: 'image', label: 'الصور' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFileTypeFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    fileTypeFilter === filter.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Files Table */}
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <FolderDown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد ملفات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-4 text-start">اسم الملف الأصلي</th>
                      <th className="p-4 text-start">النوع / الحجم</th>
                      <th className="p-4 text-start">المرجع والخدمة</th>
                      <th className="p-4 text-start">الزبون</th>
                      <th className="p-4 text-start">تاريخ الرفع</th>
                      <th className="p-4 text-start">حالة الرفع</th>
                      <th className="p-4 text-start">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredFiles.map((item, idx) => {
                      const isPdf = item.file.mimeType.includes('pdf') || item.file.originalName.toLowerCase().endsWith('.pdf');
                      const isWord = item.file.mimeType.includes('word') || /\.(doc|docx)$/i.test(item.file.originalName);
                      const isImage = item.file.mimeType.startsWith('image/');

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5 max-w-xs">
                              <div className={`p-2 rounded-xl shrink-0 ${isPdf ? 'bg-rose-100 text-rose-700' : isWord ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="font-bold text-slate-900 truncate" title={item.file.originalName}>
                                  {item.file.originalName}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.file.mimeType || 'Document'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs font-semibold">
                            <span className="block text-slate-900">{formatFileSize(item.file.size)}</span>
                            <span className="text-[11px] text-slate-400 uppercase">
                              {isPdf ? 'PDF' : isWord ? 'Word Doc' : isImage ? 'Image' : 'File'}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-mono font-bold text-emerald-700 block">{item.referenceCode}</span>
                            <span className="text-[11px] text-slate-500">
                              {item.sourceType === 'print' ? 'طباعة ونسخ' : 'مذكرة تخرج'}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-slate-900">{item.customerName}</p>
                            <p className="text-xs text-slate-500 font-mono" dir="ltr">{item.customerPhone}</p>
                          </td>

                          <td className="p-4 text-xs text-slate-500">
                            {new Date(item.file.uploadedAt).toLocaleString()}
                          </td>

                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" />
                              <span>مكتمل بالسحابة</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewFile(item.file)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                                title="معاينة الملف"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => triggerFileDownload(item.file.downloadUrl, item.file.originalName)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                                title="تحميل الملف الأصلي"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>تحميل</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CUSTOMERS MANAGEMENT */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة حسابات الزبائن المسجلين</h2>
              <p className="text-xs text-slate-500">
                عرض حسابات الزبائن، بيانات الاتصال، وإحصائيات طلبات كل حساب.
              </p>
            </div>

            <button
              onClick={() => {
                const headers = ['المعرف', 'الاسم', 'البريد الإلكتروني', 'الهاتف', 'الصلاحية', 'تاريخ التسجيل'];
                const rows = customers.map((c) => [
                  c.uid,
                  c.displayName || '',
                  c.email || '',
                  c.phone || '',
                  c.role,
                  c.createdAt || ''
                ]);
                exportToCsv('Maktaba113_Customers', headers, rows);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير قائمة الزبائن CSV</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              className="w-full ps-10 pe-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          {/* Customers Table */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا يوجد زبائن مسجلون مطابقون</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-4 text-start">الزبون</th>
                      <th className="p-4 text-start">البريد الإلكتروني</th>
                      <th className="p-4 text-start">رقم الهاتف</th>
                      <th className="p-4 text-start">الطلبات المرتبطة</th>
                      <th className="p-4 text-start">تاريخ الانضمام</th>
                      <th className="p-4 text-start">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCustomers.map((cust) => {
                      const custOrders = orders.filter((o) => o.customerUid === cust.uid);
                      const custPrints = prints.filter((p) => p.customerUid === cust.uid);
                      const custTheses = research.filter((r) => r.customerUid === cust.uid);
                      const totalRequests = custOrders.length + custPrints.length + custTheses.length;

                      return (
                        <tr key={cust.uid} className="hover:bg-slate-50/60">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {cust.displayName ? cust.displayName[0].toUpperCase() : 'C'}
                              </div>
                              <span className="font-bold text-slate-900">{cust.displayName || 'زبون بدون اسم'}</span>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs">{cust.email}</td>

                          <td className="p-4 font-mono text-xs" dir="ltr">{cust.phone || 'غير مسجل'}</td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-bold text-slate-800 text-xs">
                              {totalRequests} معاملة ({custOrders.length} متجر • {custPrints.length} طباعة • {custTheses.length} مذكرة)
                            </span>
                          </td>

                          <td className="p-4 text-xs text-slate-500">
                            {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : '—'}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {cust.phone && (
                                <a
                                  href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                                  title="مراسلة عبر واتساب"
                                >
                                  واتساب
                                </a>
                              )}

                              <button
                                onClick={async () => {
                                  if (window.confirm(`هل أنت متأكد من حذف سجل الزبون "${cust.displayName || cust.email}" من قاعدة البيانات؟`)) {
                                    await deleteUserRecord(cust.uid);
                                    await logAdminAction('DELETE_USER_RECORD', `Deleted customer record ${cust.email}`, currentUser!.email!, cust.uid);
                                    showSuccess('تم حذف سجل الزبون');
                                  }
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="حذف السجل"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة المنتجات والأسعار والمخزون</h2>
              <p className="text-xs text-slate-500">يمكنك تعديل الأسعار، تغيير الصور، وضبط المخزون أو إخفاء المنتج بنقرة واحدة.</p>
            </div>

            <button
              onClick={() => setEditingProduct({
                name: '',
                description: '',
                price: 100,
                stock: 10,
                category: 'cat_school_supplies',
                imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                isActive: true
              })}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewProduct')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="relative">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-36 object-cover rounded-2xl mb-3 bg-slate-50"
                    />
                    <span className={`absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${p.isActive !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      {p.isActive !== false ? 'معروض للزبائن' : 'مخفي'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h3>
                  <div className="flex items-center justify-between my-2 text-xs">
                    <span className="font-black text-emerald-700">{p.discountPrice || p.price} {t('currency')}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md font-semibold">المخزون: {p.stock}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={async () => {
                        const newActive = !(p.isActive !== false);
                        await saveProduct({ id: p.id, isActive: newActive });
                        showSuccess(newActive ? 'تم إظهار المنتج في المتجر' : 'تم إخفاء المنتج عن الزبائن');
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg font-bold text-[11px] ${p.isActive !== false ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                    >
                      {p.isActive !== false ? 'إخفاء المنتج' : 'إظهار المنتج'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (window.confirm(`هل أنت متأكد من حذف المنتج "${p.name}" نهائياً من قاعدة البيانات؟`)) {
                          await deleteProduct(p.id);
                          await logAdminAction('DELETE_PRODUCT', `Deleted product ${p.name}`, currentUser!.email!, p.id);
                          showSuccess('تم حذف المنتج بنجاح');
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: JOB OFFERS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">إدارة إعلانات وعروض التوظيف</h2>
            <button
              onClick={() => setEditingJob({
                title: '',
                organization: '',
                wilaya: 'الجزائر العاصمة',
                specialty: 'عام',
                description: '',
                status: 'active'
              })}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewJob')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">{j.wilaya}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{j.title}</h4>
                  <p className="text-xs text-slate-500">{j.organization}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingJob(j)}
                    className="p-2 hover:bg-slate-100 text-purple-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('هل تريد حذف هذا الإعلان؟')) {
                        await deleteJobOffer(j.id);
                        showSuccess('تم الحذف');
                      }
                    }}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: LESSONS BANK */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">إدارة بنك الدروس والتمارين</h2>
            <button
              onClick={() => setEditingLesson({
                title: '',
                level: 'high',
                subject: 'الرياضيات',
                semester: '1',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                fileName: 'doc.pdf',
                fileSize: 1024 * 1024
              })}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewLesson')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((l) => (
              <div key={l.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">{l.subject}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{l.title}</h4>
                  <p className="text-xs text-slate-500">{l.level} • {l.grade}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingLesson(l)}
                    className="p-2 hover:bg-slate-100 text-rose-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('هل تريد حذف هذا الدرس؟')) {
                        await deleteLesson(l.id);
                        showSuccess('تم الحذف');
                      }
                    }}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: BANNERS & PROMOTIONS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة الصور والبنرات الإعلانية</h2>
              <p className="text-xs text-slate-500">إدارة البنرات والعروض الترويجية الرئيسية المعروضة في الصفحة الرئيسية</p>
            </div>
            <button
              onClick={() => setEditingBanner({
                title: '',
                subtitle: '',
                imageUrl: '',
                linkUrl: '',
                order: bannersList.length + 1,
                isActive: true
              })}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة بنر جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bannersList.length === 0 ? (
              <div className="col-span-full p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold">لا توجد بنرات مضافة حالياً</p>
                <p className="text-xs text-slate-500 mt-1">اضغط على «إضافة بنر جديد» لرفع صور ترويجية للمتجر أو خدمات الطباعة</p>
              </div>
            ) : (
              bannersList.map((banner) => (
                <div key={banner.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <span className={`absolute top-3 end-3 px-2 py-0.5 rounded-md text-[10px] font-bold ${banner.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {banner.isActive ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{banner.title}</h4>
                      {banner.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{banner.subtitle}</p>}
                      {banner.linkUrl && (
                        <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 hover:underline block truncate mt-1">
                          {banner.linkUrl}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        onClick={async () => {
                          await saveBanner({ id: banner.id, isActive: !banner.isActive });
                          showSuccess('تم تحديث حالة البنر');
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-emerald-700 cursor-pointer"
                      >
                        {banner.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingBanner(banner)}
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('هل أنت متأكد من حذف هذا البنر؟')) {
                              await deleteBanner(banner.id);
                              showSuccess('تم حذف البنر');
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: DOCUMENT EXTRACTION REQUESTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">طلبات التسجيل في المسابقات واستخراج الوثائق</h2>
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                  {documents.length} طلب
                </span>
              </div>
              <p className="text-xs text-slate-500">طلبات التسجيل في مسابقات الأساتذة، القضاة، الحماية، الشرطة، السكن، واستخراج مختلف الوثائق والاستمارات</p>
            </div>

            <button
              onClick={() => {
                const headers = ['الرمز المرجعي', 'الزبون', 'الهاتف', 'البريد الإلكتروني', 'الخدمة / الوثيقة', 'رقم التعريف/NIN', 'عدد المرفقات', 'الحالة', 'التاريخ'];
                const rows = documents.map((d) => [
                  d.referenceCode,
                  d.customerName,
                  d.customerPhone,
                  d.customerEmail,
                  d.docCategory,
                  d.nationalIdOrNin || '',
                  d.attachedFiles?.length || 0,
                  d.status,
                  d.createdAt
                ]);
                exportToCsv('maktaba113_competitions_documents', headers, rows);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، الهاتف، البريد أو رقم التعريف..."
              className="w-full ps-10 pe-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-4">
            {documents
              .filter((d) => {
                if (!docSearchQuery.trim()) return true;
                const q = docSearchQuery.toLowerCase();
                return (
                  d.customerName.toLowerCase().includes(q) ||
                  d.customerPhone.includes(q) ||
                  d.customerEmail.toLowerCase().includes(q) ||
                  d.referenceCode.toLowerCase().includes(q) ||
                  d.docCategory.toLowerCase().includes(q) ||
                  (d.nationalIdOrNin && d.nationalIdOrNin.toLowerCase().includes(q))
                );
              })
              .map((docItem) => (
                <div key={docItem.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-slate-900 text-base">{docItem.referenceCode}</span>
                          <span className="text-xs px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-bold">
                            {docItem.docCategory}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(docItem.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={docItem.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as OrderStatus;
                          await updateDocumentRequest(docItem.id, { status: newStatus });
                          await logAdminAction('UPDATE_DOC_STATUS', `Updated ${docItem.referenceCode} to ${newStatus}`, currentUser!.email!, docItem.id);
                          showSuccess('تم تحديث حالة الطلب');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 cursor-pointer"
                      >
                        <option value="new">جديد (قيد المراجعة)</option>
                        <option value="processing">قيد التسجيل / السحب</option>
                        <option value="ready">جاهز (تم التسجيل / الاستخراج)</option>
                        <option value="completed">مكتمل ومسلّم</option>
                        <option value="cancelled">ملغى</option>
                      </select>

                      <button
                        onClick={async () => {
                          if (window.confirm(`هل أنت متأكد من حذف طلب ${docItem.referenceCode}؟`)) {
                            await deleteDocumentRequest(docItem.id);
                            showSuccess('تم حذف الطلب');
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="حذف الطلب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block font-semibold">صاحب الطلب:</span>
                      <span className="font-bold text-slate-900">{docItem.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">الهاتف:</span>
                      <a href={`tel:${docItem.customerPhone}`} className="font-mono font-bold text-emerald-700 hover:underline" dir="ltr">
                        {docItem.customerPhone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">البريد الإلكتروني:</span>
                      <a href={`mailto:${docItem.customerEmail}`} className="font-mono text-teal-700 hover:underline truncate block" dir="ltr">
                        {docItem.customerEmail}
                      </a>
                    </div>
                  </div>

                  {docItem.nationalIdOrNin && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                      <span><strong>الرقم التعريفي / التسجيل / NIN: </strong><code className="font-mono font-bold">{docItem.nationalIdOrNin}</code></span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(docItem.nationalIdOrNin || '');
                          showSuccess('تم نسخ الرقم');
                        }}
                        className="text-[11px] px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded font-bold cursor-pointer"
                      >
                        نسخ الرقم
                      </button>
                    </div>
                  )}

                  {docItem.notes && (
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <strong>ملاحظات الزبون: </strong>{docItem.notes}
                    </p>
                  )}

                  {/* Customer Attached Files */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      الملفات والمستندات المرفقة من الزبون ({docItem.attachedFiles?.length || 0}):
                    </span>
                    {docItem.attachedFiles && docItem.attachedFiles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {docItem.attachedFiles.map((f, fIdx) => (
                          <div key={fIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold block truncate" title={f.originalName}>{f.originalName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{formatFileSize(f.size)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewFile(f)}
                                className="p-1 hover:bg-white text-teal-700 rounded-md shadow-2xs"
                                title="معاينة"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerFileDownload(f.downloadUrl, f.originalName)}
                                className="p-1 hover:bg-white text-emerald-700 rounded-md shadow-2xs"
                                title="تحميل الملف الأصلي"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic block">لا توجد ملفات مرفوعة مع هذا الطلب.</span>
                    )}
                  </div>

                  {/* Result files generated by Admin */}
                  {docItem.resultFiles && docItem.resultFiles.length > 0 && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-emerald-950 block">الملفات والوصولات المنجزة من المكتبة:</span>
                      <div className="space-y-1.5">
                        {docItem.resultFiles.map((rf, rfIdx) => (
                          <div key={rfIdx} className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800 truncate">{rf.originalName} ({formatFileSize(rf.size)})</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewFile(rf)}
                                className="p-1 text-teal-700 hover:bg-slate-100 rounded"
                                title="معاينة"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerFileDownload(rf.downloadUrl, rf.originalName)}
                                className="p-1 text-emerald-700 hover:bg-slate-100 rounded"
                                title="تحميل"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin note update input and upload result file */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
                    <input
                      type="text"
                      defaultValue={docItem.adminNote || ''}
                      placeholder="أضف ملاحظة أو رقم وصل للزبون..."
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val !== (docItem.adminNote || '')) {
                          await updateDocumentRequest(docItem.id, { adminNote: val });
                          showSuccess('تم حفظ ملاحظة المشرف');
                        }
                      }}
                      className="flex-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />

                    <label className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>إرفاق وثيقة منجزة للزبون</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const uploaded = await uploadFile(file, 'documents_results');
                            const currentResults = docItem.resultFiles || [];
                            await updateDocumentRequest(docItem.id, {
                              resultFiles: [...currentResults, uploaded],
                              status: 'ready'
                            });
                            showSuccess('تم رفع المستخرج أو وصل التسجيل بنجاح');
                          } catch (uploadErr) {
                            alert('فشل رفع الملف: ' + (uploadErr instanceof Error ? uploadErr.message : 'خطأ'));
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: FLEXY & RECHARGE REQUESTS */}
      {activeTab === 'flexy' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">إدارة طلبات شحن الأرصدة فليكسي وإيدوم</h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {flexyList.length} طلب
                </span>
              </div>
              <p className="text-xs text-slate-500">معالجة شحن أرصدة موبيليس، جيزي، أوريدو، واشتراكات إيدوم فيبر يدوياً</p>
            </div>

            <button
              onClick={() => {
                const headers = ['الرمز المرجعي', 'المتعامل', 'رقم الهاتف أو العقد', 'المبلغ (دج)', 'الزبون', 'الهاتف للتأكيد', 'الحالة', 'التاريخ'];
                const rows = flexyList.map((f) => [
                  f.referenceCode,
                  f.operator,
                  f.targetNumberOrContract,
                  f.amount,
                  f.customerName,
                  f.customerPhone,
                  f.status,
                  f.createdAt
                ]);
                exportToCsv('maktaba113_flexy', headers, rows);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>

          {/* Quick stats & filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'mobilis', label: 'موبيليس Mobilis' },
                { id: 'djezzy', label: 'جيزي Djezzy' },
                { id: 'ooredoo', label: 'أوريدو Ooredoo' },
                { id: 'idoom_fibre', label: 'إيدوم فيبر Idoom' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFlexyOperatorFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    flexyOperatorFilter === pill.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 start-3 pointer-events-none" />
              <input
                type="text"
                value={flexySearchQuery}
                onChange={(e) => setFlexySearchQuery(e.target.value)}
                placeholder="بحث برقم الهاتف، العقد، المرجع..."
                className="w-full ps-9 pe-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {flexyList
              .filter((f) => {
                if (flexyOperatorFilter !== 'all' && f.operator !== flexyOperatorFilter) return false;
                if (!flexySearchQuery.trim()) return true;
                const q = flexySearchQuery.toLowerCase();
                return (
                  f.referenceCode.toLowerCase().includes(q) ||
                  f.targetNumberOrContract.toLowerCase().includes(q) ||
                  f.customerName.toLowerCase().includes(q) ||
                  f.customerPhone.includes(q)
                );
              })
              .map((flexyItem) => {
                const opColor =
                  flexyItem.operator === 'mobilis'
                    ? 'bg-emerald-600 text-white'
                    : flexyItem.operator === 'djezzy'
                    ? 'bg-red-600 text-white'
                    : flexyItem.operator === 'ooredoo'
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-600 text-white';

                return (
                  <div key={flexyItem.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${opColor}`}>
                          {flexyItem.operator === 'idoom_fibre' ? 'Idoom Fibre' : flexyItem.operator}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm">{flexyItem.referenceCode}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {new Date(flexyItem.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={flexyItem.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as FlexyStatus;
                            await updateFlexyRequest(flexyItem.id, { status: newStatus });
                            await logAdminAction('UPDATE_FLEXY_STATUS', `Updated ${flexyItem.referenceCode} to ${newStatus}`, currentUser!.email!, flexyItem.id);
                            showSuccess('تم تحديث حالة طلب الشحن');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 cursor-pointer"
                        >
                          <option value="new">جديد (قيد الانتظار)</option>
                          <option value="processing">جاري التنفيذ بالجهاز</option>
                          <option value="completed">تم الشحن بنجاح ✓</option>
                          <option value="rejected">مرفوض / فشل العملية</option>
                        </select>

                        <button
                          onClick={async () => {
                            if (window.confirm(`هل أنت متأكد من حذف طلب الشحن ${flexyItem.referenceCode}؟`)) {
                              await deleteFlexyRequest(flexyItem.id);
                              showSuccess('تم الحذف');
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl items-center">
                      <div>
                        <span className="text-slate-400 block font-semibold">
                          {flexyItem.operator === 'idoom_fibre' ? 'رقم العقد / الاشتراك:' : 'الرقم المراد شحنه:'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-black text-slate-900 text-base" dir="ltr">
                            {flexyItem.targetNumberOrContract}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(flexyItem.targetNumberOrContract);
                              showSuccess('تم نسخ الرقم');
                            }}
                            className="text-[10px] px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold cursor-pointer"
                          >
                            نسخ
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-semibold">مبلغ الشحن:</span>
                        <span className="font-black text-emerald-700 text-lg">
                          {flexyItem.amount} دج
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-semibold">الزبون للتأكيد:</span>
                        <span className="font-bold text-slate-800">{flexyItem.customerName}</span>
                        <a href={`tel:${flexyItem.customerPhone}`} className="block font-mono text-slate-500 hover:underline" dir="ltr">
                          {flexyItem.customerPhone}
                        </a>
                      </div>
                    </div>

                    {/* Admin transaction note */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={flexyItem.adminNote || ''}
                        placeholder="أدخل رقم المعاملة أو ملاحظة الشحن للزبون..."
                        onBlur={async (e) => {
                          const val = e.target.value.trim();
                          if (val !== (flexyItem.adminNote || '')) {
                            await updateFlexyRequest(flexyItem.id, { adminNote: val });
                            showSuccess('تم حفظ إشعار الشحن');
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB: BILL PAYMENTS */}
      {activeTab === 'bills' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">إدارة تسديد الفواتير العمومية</h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                  {billsList.length} فاتورة
                </span>
              </div>
              <p className="text-xs text-slate-500">فواتير الكهرباء والغاز سونلغاز، الجزائرية للمياه ADE، الهاتف الثابت والإنترنت</p>
            </div>

            <button
              onClick={() => {
                const headers = ['الرمز المرجعي', 'المرفق', 'رقم الفاتورة / المرجع', 'المبلغ (دج)', 'الزبون', 'الهاتف', 'الحالة', 'التاريخ'];
                const rows = billsList.map((b) => [
                  b.referenceCode,
                  b.billType,
                  b.billReference,
                  b.amount,
                  b.customerName,
                  b.customerPhone,
                  b.status,
                  b.createdAt
                ]);
                exportToCsv('maktaba113_bills', headers, rows);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
            <input
              type="text"
              value={billsSearchQuery}
              onChange={(e) => setBillsSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، الهاتف، رقم الفاتورة أو المرجع..."
              className="w-full ps-10 pe-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-4">
            {billsList
              .filter((b) => {
                if (!billsSearchQuery.trim()) return true;
                const q = billsSearchQuery.toLowerCase();
                return (
                  b.referenceCode.toLowerCase().includes(q) ||
                  b.billReference.toLowerCase().includes(q) ||
                  b.customerName.toLowerCase().includes(q) ||
                  b.customerPhone.includes(q)
                );
              })
              .map((billItem) => (
                <div key={billItem.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">{billItem.referenceCode}</span>
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded font-bold">
                            {billItem.billType === 'electricity_gas'
                              ? 'سونلغاز'
                              : billItem.billType === 'water'
                              ? 'الجزائرية للمياه ADE'
                              : billItem.billType === 'landline'
                              ? 'الهاتف الثابت'
                              : 'إنترنت اتصالات الجزائر'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(billItem.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={billItem.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as FlexyStatus;
                          await updateBillPayment(billItem.id, { status: newStatus });
                          await logAdminAction('UPDATE_BILL_STATUS', `Updated ${billItem.referenceCode} to ${newStatus}`, currentUser!.email!, billItem.id);
                          showSuccess('تم تحديث حالة الفاتورة');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 cursor-pointer"
                      >
                        <option value="new">جديدة (قيد المراجعة)</option>
                        <option value="processing">جاري التسديد بالوكالة</option>
                        <option value="completed">تم التسديد وتسليم الوصل ✓</option>
                        <option value="rejected">مرفوضة / ملغاة</option>
                      </select>

                      <button
                        onClick={async () => {
                          if (window.confirm(`هل أنت متأكد من حذف طلب الفاتورة ${billItem.referenceCode}؟`)) {
                            await deleteBillPayment(billItem.id);
                            showSuccess('تم الحذف');
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block font-semibold">رقم الفاتورة / المرجع:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-slate-900">{billItem.billReference}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(billItem.billReference);
                            showSuccess('تم نسخ رقم الفاتورة');
                          }}
                          className="text-[10px] px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold cursor-pointer"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-semibold">مبلغ الفاتورة:</span>
                      <span className="font-black text-indigo-700 text-lg">{billItem.amount} دج</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-semibold">الزبون:</span>
                      <span className="font-bold text-slate-800">{billItem.customerName}</span>
                      <a href={`tel:${billItem.customerPhone}`} className="block font-mono text-slate-500 hover:underline" dir="ltr">
                        {billItem.customerPhone}
                      </a>
                    </div>
                  </div>

                  {/* Attached bill file action */}
                  {billItem.billFile && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-700" />
                        <span className="font-medium text-slate-800 truncate max-w-xs">{billItem.billFile.originalName}</span>
                        <span className="text-slate-400">({formatFileSize(billItem.billFile.size)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewFile(billItem.billFile!)}
                          className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold border border-indigo-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة</span>
                        </button>
                        <button
                          onClick={() => triggerFileDownload(billItem.billFile!.downloadUrl, billItem.billFile!.originalName)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل الملف الأصلي</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment receipt note */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={billItem.adminNote || ''}
                      placeholder="أضف ملاحظة الدفع أو رقم وصل الوكالة..."
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val !== (billItem.adminNote || '')) {
                          await updateBillPayment(billItem.id, { adminNote: val });
                          showSuccess('تم حفظ ملاحظة التسديد');
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: CUSTOMER INQUIRIES & MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">رسائل واستفسارات الزبائن</h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {messagesList.length} رسالة
                </span>
              </div>
              <p className="text-xs text-slate-500">الاستفسارات الواردة عبر نموذج الاتصال المباشر بالموقع</p>
            </div>
          </div>

          <div className="space-y-3">
            {messagesList.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold">صندوق الرسائل فارغ حالياً</p>
              </div>
            ) : (
              messagesList.map((msg) => (
                <div key={msg.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{msg.subject || 'بدون موضوع'}</h4>
                        <span className="text-xs text-slate-500 font-medium">من: {msg.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={async () => {
                          if (window.confirm('هل تريد حذف هذه الرسالة؟')) {
                            await deleteCustomerMessage(msg.id);
                            showSuccess('تم حذف الرسالة');
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-4">
                      <a href={`tel:${msg.phone}`} className="font-mono text-slate-600 hover:text-emerald-700 font-bold flex items-center gap-1" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{msg.phone}</span>
                      </a>
                      {msg.email && (
                        <a href={`mailto:${msg.email}`} className="font-mono text-slate-600 hover:text-emerald-700 font-bold flex items-center gap-1" dir="ltr">
                          <Mail className="w-3.5 h-3.5 text-teal-600" />
                          <span>{msg.email}</span>
                        </a>
                      )}
                    </div>

                    <button
                      onClick={async () => {
                        const newStatus = msg.status === 'replied' ? 'new' : 'replied';
                        await updateCustomerMessage(msg.id, { status: newStatus, isRead: true });
                        showSuccess(newStatus === 'replied' ? 'تم تعيين الرسالة كـ "تم الرد"' : 'تم تعيين الرسالة كـ "جديدة"');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        msg.status === 'replied' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {msg.status === 'replied' ? 'تم الرد ✓' : 'تعيين كـ "تم الرد"'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 15: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await updateSiteSettings(settingsForm);
            await logAdminAction('UPDATE_SETTINGS', 'Updated global site settings', currentUser!.email!);
            onRefreshSettings();
            showSuccess('تم حفظ إعدادات الموقع بنجاح في قاعدة البيانات');
          }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900">
              إعدادات المنصة وبيانات التواصل
            </h2>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
              تُحفظ تلقائياً في Firestore
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنصة باللاتينية</label>
              <input
                type="text"
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنصة بالعربية</label>
              <input
                type="text"
                value={settingsForm.siteNameAr}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteNameAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار Logo URL</label>
              <input
                type="text"
                value={settingsForm.logoUrl || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الأساسي</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم واتساب للتواصل السريع</label>
              <input
                type="text"
                value={settingsForm.phoneWhatsApp}
                onChange={(e) => setSettingsForm({ ...settingsForm, phoneWhatsApp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سعر التوصيل الافتراضي (د.ج)</label>
              <input
                type="number"
                value={settingsForm.deliveryPrice}
                onChange={(e) => setSettingsForm({ ...settingsForm, deliveryPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان بالتفصيل</label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">ساعات العمل الرسمية</label>
              <input
                type="text"
                value={settingsForm.workingHours}
                onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* November 1st Marquee Banner Toggle */}
            <div className="sm:col-span-2 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-emerald-950">
                  🇩🇿 شريط ذكرى أول نوفمبر المجيدة (المتحرك)
                </span>
                <span className="text-[11px] text-emerald-800">
                  إظهار أو إخفاء شريط التهنئة الوطني المتحرك في أعلى الموقع
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.novemberBannerEnabled !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, novemberBannerEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
            >
              حفظ وتطبيق الإعدادات
            </button>
          </div>
        </form>
      )}

      {/* TAB 11: ADMIN AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900">سجل العمليات الإدارية والولوج (Audit Trail)</h2>
            <span className="text-xs text-slate-500 font-mono">آخر 50 عملية مسجلة</span>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${log.action.includes('UNAUTHORIZED') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
                    {log.action}
                  </span>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                </div>
                <div className="text-end text-slate-400">
                  <span className="font-mono">{log.adminEmail}</span>
                  <span className="block text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">
                {editingProduct.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveProduct(editingProduct);
                await logAdminAction('SAVE_PRODUCT', `Saved product ${editingProduct.name}`, currentUser!.email!, editingProduct.id);
                setEditingProduct(null);
                showSuccess('تم حفظ المنتج بنجاح');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج بالعربية *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر (د.ج) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">سعر التخفيض (اختياري)</label>
                  <input
                    type="number"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم</label>
                  <select
                    value={editingProduct.category || 'cat_school_supplies'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="cat_school_supplies">الأدوات المدرسية والمكتبية</option>
                    <option value="cat_printing">الطباعة والورق</option>
                    <option value="cat_toys">ألعاب الأطفال والذكاء</option>
                    <option value="cat_sweets">الحلويات</option>
                    <option value="cat_cosmetics">مواد التجميل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الكمية المتوفرة بالمخزون</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط الصورة Image URL</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Job */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-base">إضافة / تعديل إعلان توظيف</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveJobOffer(editingJob);
                setEditingJob(null);
                showSuccess('تم حفظ إعلان التوظيف');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الإعلان *</label>
                <input
                  type="text"
                  required
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المؤسسة *</label>
                  <input
                    type="text"
                    required
                    value={editingJob.organization || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الولاية</label>
                  <input
                    type="text"
                    value={editingJob.wilaya || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, wilaya: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingJob(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit / Add Lesson */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-base">إضافة مورد تعليمي في بنك الدروس</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveLesson(editingLesson);
                setEditingLesson(null);
                showSuccess('تم حفظ الدرس في بنك الموارد');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الدرس / الفرض *</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المادة</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.subject || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستوى</label>
                  <select
                    value={editingLesson.level || 'high'}
                    onChange={(e) => setEditingLesson({ ...editingLesson, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="primary">الابتدائي</option>
                    <option value="middle">المتوسط</option>
                    <option value="high">الثانوي</option>
                    <option value="university">الجامعي</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رابط تحميل الملف File URL</label>
                <input
                  type="text"
                  required
                  value={editingLesson.fileUrl || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingLesson(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Direct Print Modal with status updater */}
      {directPrintTarget && (
        <DirectPrintModal
          file={directPrintTarget.file}
          requestInfo={directPrintTarget.requestInfo}
          onClose={() => setDirectPrintTarget(null)}
          onStatusUpdate={async (newStatus) => {
            try {
              if (directPrintTarget.type === 'print') {
                await updatePrintRequest(directPrintTarget.reqId, { status: newStatus });
                await logAdminAction(
                  'DIRECT_PRINT_STATUS_UPDATE',
                  `Direct print updated ${directPrintTarget.requestInfo.referenceCode} to ${newStatus}`,
                  currentUser!.email!,
                  directPrintTarget.reqId
                );
                showSuccess(`تم تحديث حالة طلب الطباعة إلى: ${newStatus === 'ready' ? 'جاهز للاستلام' : 'مكتمل'}`);
              } else if (directPrintTarget.type === 'research') {
                await updateResearchRequest(directPrintTarget.reqId, { status: newStatus });
                await logAdminAction(
                  'DIRECT_PRINT_STATUS_UPDATE',
                  `Direct print updated thesis ${directPrintTarget.requestInfo.referenceCode} to ${newStatus}`,
                  currentUser!.email!,
                  directPrintTarget.reqId
                );
                showSuccess(`تم تحديث حالة المذكرة إلى: ${newStatus === 'ready' ? 'جاهز للاستلام' : 'مكتمل'}`);
              }
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

    </div>
  );
};

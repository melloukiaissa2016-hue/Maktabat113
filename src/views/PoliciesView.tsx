import React from 'react';
import { ShieldCheck, FileText, Lock, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SiteSettings } from '../types';

interface PoliciesViewProps {
  siteSettings: SiteSettings;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ siteSettings }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          السياسات وشروط الاستخدام وحماية البيانات
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          نلتزم بأعلى معايير الخصوصية والأمان لحماية بيانات زبائن منصة Maktaba113 ومستنداتهم وملفاتهم.
        </p>
      </div>

      {/* Section 1: File Retention Policy */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {t('fileRetentionPolicy')} (سياسة الاحتفاظ بالملفات وإتلافها)
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            تولي منصة <strong>Maktaba113</strong> أهمية قصوى للملفات والمستندات والوثائق التي يقوم الزبائن والطلبة برفعها عبر خدمات الطباعة والنسخ وبحوث التخرج:
          </p>
          <ul className="space-y-2 list-none ps-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>سرية تامة:</strong> لا يتم نشر أو مشاركة أي ملف مرفوع مع أطراف ثالثة، ولا تُتاح الملفات إلا للموظف المسؤول عن الطباعة والتجهيز.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>مدة الاحتفاظ:</strong> تظل ملفات الطباعة والبحوث محفوظة في نظام التخزين الآمن لمدة <strong>{siteSettings.retentionDays || 30} يوماً</strong> من تاريخ تسليم الطلب، وذلك لتمكين الزبون من إعادة طلب نسخ إضافية عند الحاجة دون الاضطرار لإعادة رفع الملف.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>الحذف النهائي الآمن:</strong> بعد انقضاء مدة الاحتفاظ المحددة، تُحذف الملفات نهائياً من خوادم التخزين السحابي دون ترك نسخ احتياطية قابلة للاسترجاع.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>حق الحذف الفوري:</strong> يحق للزبون في أي وقت طلب حذف ملفاته فور استلام النسخ المطبوعة مباشرة عبر التواصل مع إدارة المكتبة.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 2: Privacy Policy */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Lock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {t('privacyPolicy')} (حماية البيانات الشخصية)
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            تقتصر البيانات الشخصية التي نجمعها على المعلومات الضرورية لإتمام عمليات الشراء والتوصيل والتواصل:
          </p>
          <ul className="space-y-2 list-none ps-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>الاسم ورقم الهاتف:</strong> يُستخدمان حصراً لتأكيد الطلبيات وتنسيق مواعيد الاستلام أو التوصيل.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>عنوان التوصيل:</strong> يُستخدم فقط في حال اختيار خدمة التوصيل المنزلي.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>حماية الحساب:</strong> كلمات المرور مشفرة كلياً عبر خدمات Firebase Authentication ولا يمكن لأي موظف أو شخص الاطلاع عليها.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 3: Terms of Service */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <FileText className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {t('termsOfService')} (شروط وضوابط الخدمة)
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <ul className="space-y-2 list-none ps-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>مسؤولية المحتوى:</strong> يتحمل الزبون كامل المسؤولية القانونية والأخلاقية عن محتوى الملفات والوثائق التي يقدمها للطباعة.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>الدفع والاستلام:</strong> يتم دفع المستحقات نقداً عند استلام الطلبية من مقر المكتبة أو عند وصول موزع خدمة التوصيل.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>المطابقة والجودة:</strong> في حال وجود أي خطأ مطبعي ناجم عن الطابعة، تلتزم المكتبة بإعادة الطباعة مجاناً فوراً.</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

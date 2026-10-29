import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  HelpCircle,
  ShieldAlert,
  Info,
  CreditCard,
  Wifi
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createFlexyRequest, generateReferenceCode } from '../services/dbService';

interface FlexyServiceViewProps {
  onNavigate: (view: string) => void;
}

export const FlexyServiceView: React.FC<FlexyServiceViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [operator, setOperator] = useState<'mobilis' | 'djezzy' | 'ooredoo' | 'idoom_fibre'>('mobilis');
  const [targetNumberOrContract, setTargetNumberOrContract] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phoneNumber || '');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const operators = [
    {
      id: 'mobilis',
      name: 'موبيليس (Mobilis)',
      color: 'bg-emerald-600',
      badge: '06XX',
      icon: Smartphone,
      prefixPlaceholder: '06XX XX XX XX'
    },
    {
      id: 'djezzy',
      name: 'جيزي (Djezzy)',
      color: 'bg-red-600',
      badge: '07XX',
      icon: Smartphone,
      prefixPlaceholder: '07XX XX XX XX'
    },
    {
      id: 'ooredoo',
      name: 'أوريدو (Ooredoo)',
      color: 'bg-rose-500',
      badge: '05XX',
      icon: Smartphone,
      prefixPlaceholder: '05XX XX XX XX'
    },
    {
      id: 'idoom_fibre',
      name: 'إيدوم فيبر (Idoom Fibre / ADSL)',
      color: 'bg-blue-600',
      badge: 'اتصالات الجزائر',
      icon: Wifi,
      prefixPlaceholder: 'رقم الاشتراك / العقد (مثال: 10 أو 18 رقماً)'
    }
  ];

  const presetAmounts = [100, 200, 500, 1000, 1500, 2000, 3000];

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!targetNumberOrContract.trim()) {
      setErrorMsg(
        operator === 'idoom_fibre'
          ? 'يرجى إدخال رقم الاشتراك / رقم العقد لإيدوم فيبر'
          : 'يرجى إدخال رقم الهاتف المراد شحنه'
      );
      return;
    }

    if (operator !== 'idoom_fibre') {
      const cleanNum = targetNumberOrContract.replace(/[^0-9]/g, '');
      if (cleanNum.length < 9 || cleanNum.length > 10) {
        setErrorMsg('رقم الهاتف الجزائري يجب أن يتكون من 10 أرقام (مثال: 0664751271)');
        return;
      }
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى إدخال اسمك ورقم هاتفك للتواصل وتأكيد الشحن');
      return;
    }

    if (effectiveAmount < 100) {
      setErrorMsg('الحد الأدنى للشحن هو 100 دج');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const referenceCode = generateReferenceCode('FLX');

    try {
      await createFlexyRequest({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        operator,
        targetNumberOrContract: targetNumberOrContract.trim(),
        amount: effectiveAmount,
        notes: notes.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString()
      });

      setShowConfirmModal(false);
      setConfirmedCode(referenceCode);
    } catch (err) {
      console.error('Failed to submit flexy request:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل طلب الشحن، يرجى المحاولة ثانية.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              تم تسجيل طلب الشحن بنجاح!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              سيقوم موظف مكتبة 113 بمعالجة الشحن يدوياً عبر جهاز الموزع المعتمد بعد تأكيد الدفع في المحل أو هاتفياً على ({customerPhone}).
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-700">
                {confirmedCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              تتبع حالة الشحن
            </button>
            <button
              onClick={() => {
                setConfirmedCode(null);
                setTargetNumberOrContract('');
                setNotes('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              طلب شحن رصيد آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="w-9 h-9 text-emerald-200" />
          <h1 className="text-2xl sm:text-3xl font-black">شحن الأرصدة فليكسي واشتراك إيدوم فيبر</h1>
        </div>
        <p className="text-emerald-100 text-xs sm:text-base max-w-2xl leading-relaxed">
          شحن رصيد هواتف موبيليس، جيزي، وأوريدو، وتسديد باقات إيدوم فيبر لاتصالات الجزائر بكل أمان وسهولة بمكتبة 113.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleValidateAndOpenConfirm} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Step 1: Select Operator */}
        <div>
          <label className="block text-sm font-black text-slate-900 mb-3">1. اختر المتعامل أو الخدمة *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {operators.map((op) => {
              const Icon = op.icon;
              const isSelected = operator === op.id;
              return (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => setOperator(op.id as any)}
                  className={`p-4 rounded-2xl border text-start flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl text-white ${op.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold">
                      {op.badge}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">{op.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Target Phone / Contract */}
        <div>
          <label className="block text-sm font-black text-slate-900 mb-1.5 flex items-center gap-1.5">
            {operator === 'idoom_fibre' ? (
              <>
                <Wifi className="w-4 h-4 text-blue-600" />
                <span>رقم الاشتراك أو رقم العقد (Idoom Fibre / ADSL) *</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>رقم الهاتف المراد شحنه *</span>
              </>
            )}
          </label>
          <input
            type="text"
            required
            value={targetNumberOrContract}
            onChange={(e) => setTargetNumberOrContract(e.target.value)}
            placeholder={operators.find((o) => o.id === operator)?.prefixPlaceholder}
            dir="ltr"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-start"
          />
          {operator === 'idoom_fibre' ? (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2.5 rounded-xl mt-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                ملاحظة هامة: بالنسبة لإيدوم فيبر، يرجى كتابة <strong>رقم العقد أو رقم الاشتراك المكتوب على وصل اتصالات الجزائر</strong> وليس رقم الهاتف النقال.
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">تأكد جيداً من صحة رقم الهاتف لتفادي شحن رصيد عن طريق الخطأ.</p>
          )}
        </div>

        {/* Step 3: Amount */}
        <div>
          <label className="block text-sm font-black text-slate-900 mb-2">2. حدد مبلغ الشحن (بالدينار الجزائري DZD) *</label>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-3">
            {presetAmounts.map((amt) => {
              const isSelected = !customAmount && amount === amt;
              return (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {amt} دج
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">أو مبلغ مخصص:</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="100"
                step="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="أدخل المبلغ (مثال: 450)"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="absolute end-3 top-2 text-xs font-bold text-slate-400">DZD</span>
            </div>
          </div>
        </div>

        {/* Step 4: Customer Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('fullName')} *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="اسم صاحب الطلب"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم هاتف الاتصال للتأكيد *</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0664 75 12 71"
              dir="ltr"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-start"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات إضافية (اختياري)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: تجديد عرض PixX أو تعبئة باقة 20 ميغا..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Manual Processing Disclaimer */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>شفافية المعاملة:</strong> يتم تنفيذ طلبات الشحن يدوياً من طرف موظفي مكتبة 113 عبر أجهزة ونقاط البيع المعتمدة داخل المحل بعد التحقق من البيانات وتأكيد الدفع. نحن نضمن لكم المعالجة المباشرة وتزويدكم بوصل الشحن.
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-5 h-5" />
          <span>متابعة وتأكيد طلب الشحن ({effectiveAmount} دج)</span>
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">تأكيد طلب الشحن</h3>
                <p className="text-xs text-slate-500">يرجى مراجعة البيانات قبل الإرسال النهائي</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">المتعامل / الخدمة:</span>
                <span className="font-bold text-slate-900">{operators.find((o) => o.id === operator)?.name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">
                  {operator === 'idoom_fibre' ? 'رقم العقد / الاشتراك:' : 'رقم الهاتف:'}
                </span>
                <span className="font-bold font-mono text-emerald-700 text-base" dir="ltr">{targetNumberOrContract}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">مبلغ الشحن:</span>
                <span className="font-black text-slate-900 text-base">{effectiveAmount} دج</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">صاحب الطلب:</span>
                <span className="font-bold text-slate-800">{customerName} ({customerPhone})</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
              تنبيه: سيتم تسجيل هذا الطلب برقم مرجعي فريد في قاعدة بيانات مكتبة 113 لمعالجته يدوياً من طرف المشرف.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                تعديل البيانات
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'جاري التسجيل...' : 'تأكيد وإرسال الطلب'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
  Store,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, generateReferenceCode } from '../services/dbService';
import { SiteSettings } from '../types';

interface CartViewProps {
  onNavigate: (view: string) => void;
  siteSettings: SiteSettings;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate, siteSettings }) => {
  const { t, direction } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { currentUser } = useAuth();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const deliveryFee = deliveryMethod === 'delivery' ? siteSettings.deliveryPrice : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCopyCode = () => {
    if (confirmedCode) {
      navigator.clipboard.writeText(confirmedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('يرجى ملء الاسم ورقم الهاتف لتأكيد الطلب');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('يرجى إدخال عنوان التوصيل بالتفصيل');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('السلة فارغة');
      return;
    }

    setIsSubmitting(true);
    const referenceCode = generateReferenceCode('ORD');

    try {
      await createOrder({
        referenceCode,
        customerUid: currentUser?.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
        notes: notes.trim() || undefined,
        items,
        subtotal,
        deliveryFee,
        total: grandTotal,
        status: 'new',
        paymentMethod: deliveryMethod === 'delivery' ? 'cash_on_delivery' : 'cash_in_store',
        createdAt: new Date().toISOString()
      });

      clearCart();
      setConfirmedCode(referenceCode);
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      setErrorMsg('فشل تسجيل الطلب في قاعدة البيانات. يرجى التأكد من اتصالك والمحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('orderSuccess')}
            </h2>
            <p className="text-sm text-slate-600">
              تم استلام طلبك بنجاح وحفظه في سجلات المكتبة. سنتصل بك على الرقم ({customerPhone}) لتأكيد التجهيز.
            </p>
          </div>

          {/* Reference Code Box */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs text-slate-500 font-semibold">{t('orderRefIs')}</span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-emerald-700">
                {confirmedCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="نسخ الرقم"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200/60 inline-block">
              {t('keepRefNote')}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              متابعة حالة الطلب
            </button>
            <button
              onClick={() => onNavigate('store')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              مواصلة التسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">{t('cartEmpty')}</h2>
        <p className="text-sm text-slate-500">{t('cartEmptyDesc')}</p>
        <button
          onClick={() => onNavigate('store')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
        >
          <span>{t('heroBrowseStore')}</span>
          <Arrow className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-emerald-600" />
        <span>{t('cartTitle')} ({items.reduce((s, i) => s + i.quantity, 0)})</span>
      </h1>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.productId} className="p-4 sm:p-5 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate mb-1" title={item.name}>
                    {item.name}
                  </h3>
                  <p className="text-emerald-700 font-black text-sm mb-3">
                    {item.price} {t('currency')}
                  </p>

                  {/* Quantity and Delete */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal per item */}
                <div className="text-end shrink-0">
                  <span className="font-black text-slate-900 text-sm sm:text-base">
                    {item.price * item.quantity} {t('currency')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              {t('customerInfo')}
            </h2>

            {/* Delivery Method Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('deliveryOption')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3.5 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Store className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold">{t('pickupInStore')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3.5 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Truck className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold">
                    {t('homeDelivery')} (+{siteSettings.deliveryPrice} {t('currency')})
                  </span>
                </button>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="محمد بن سالم"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('phoneNumber')} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0661 23 45 67"
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-start"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('emailOptional')}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="user@example.com"
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-start"
                />
              </div>

              {deliveryMethod === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('deliveryAddress')} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="الحي، رقم العمارة، الطابق، اسم المدينة..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('orderNotes')}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول وقت التسليم أو أي استفسار..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}</span>
                <span className="font-bold">{subtotal} {t('currency')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('deliveryFee')}</span>
                <span className="font-bold">
                  {deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ${t('currency')}`}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>{t('total')}</span>
                <span className="text-emerald-700">{grandTotal} {t('currency')}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                الدفع: {t('payOnDelivery')}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base"
            >
              {isSubmitting ? t('loading') : t('submitOrder')}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

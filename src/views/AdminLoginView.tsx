import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, BOOTSTRAP_ADMIN_EMAIL } from '../firebase';
import { logAdminAction } from '../services/dbService';
import { useLanguage } from '../context/LanguageContext';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onNavigateHome }) => {
  const { direction } = useLanguage();
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Strict role verification on the server/DB
      const isBootstrapAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      let hasAdminPrivilege = isBootstrapAdmin;

      if (!hasAdminPrivilege) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const snap = await getDoc(adminDocRef);
          if (snap.exists() && snap.data().role === 'admin') {
            hasAdminPrivilege = true;
          }
        } catch {
          hasAdminPrivilege = false;
        }
      }

      if (!hasAdminPrivilege) {
        // Immediate expulsion of non-admin account
        await signOut(auth);
        await logAdminAction(
          'UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT',
          `Rejected non-admin user ${user.email} from entering /admin`,
          user.email || 'unknown',
          user.uid
        );
        setErrorMsg('تم رفض الوصول: هذا الحساب ليس لديه صلاحيات الإدارة المعتمدة.');
        setLoading(false);
        return;
      }

      // Success
      await logAdminAction('ADMIN_LOGIN_SUCCESS', `Admin logged in successfully`, user.email!, user.uid);
      onSuccess();
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const msg = err instanceof Error ? err.message : '';
      if (
        msg.includes('user-not-found') ||
        msg.includes('wrong-password') ||
        msg.includes('invalid-credential')
      ) {
        setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (msg.includes('too-many-requests')) {
        setErrorMsg('تم حظر المحاولات مؤقتاً بسبب تكرار المحاولة، يرجى الانتظار دقيقة.');
      } else {
        setErrorMsg('فشل تسجيل الدخول: تحقق من الاتصال وبيانات الاعتماد.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني الخاص بالمدير أولاً');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg('تم إرسال رابط آمن لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setErrorMsg('تعذر إرسال رابط الاستعادة، يرجى التأكد من صحة البريد الإلكتروني.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Security Shield Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              بوابة الدخول الإدارية الآمنة
            </span>
            <h1 className="text-2xl font-black text-white mt-2">
              Maktaba113 Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              منطقة مخصصة حصرياً لمالك المنصة وإدارة مكتبة 113
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                البريد الإلكتروني المعتمد للمدير
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@maktaba113.com"
                  dir="ltr"
                  className="w-full ps-11 pe-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline"
                >
                  استعادة كلمة المرور؟
                </button>
              </div>

              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full ps-11 pe-11 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-200 p-1"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق والولوج...' : 'دخول لوحة الإدارة'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                أدخل البريد الإلكتروني المسجل للمدير
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@maktaba113.com"
                  dir="ltr"
                  className="w-full ps-11 pe-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 block"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Arrow className="w-4 h-4" />
            <span>العودة للمتجر والواجهة العامة</span>
          </button>
        </div>

      </div>
    </div>
  );
};

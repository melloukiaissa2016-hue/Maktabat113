import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldAlert,
  Sparkles,
  UserPlus
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  const [email, setEmail] = useState(BOOTSTRAP_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'setup' | 'forgot'>('login');

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

      // Ensure admin document exists
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          lastLoginAt: new Date().toISOString()
        },
        { merge: true }
      );

      // Success
      await logAdminAction('ADMIN_LOGIN_SUCCESS', `Admin logged in successfully`, user.email!, user.uid);
      onSuccess();
    } catch (err: unknown) {
      console.error('Admin login error:', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found')) {
        setErrorMsg(
          'لم يتم إنشاء كلمة مرور لهذا البريد بعد في Firebase. يمكنك الضغط على "تعيين كلمة مرور جديدة لأول مرة" بالأسفل أو الدخول المباشر بحساب Google.'
        );
      } else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMsg('كلمة المرور غير صحيحة. يمكنك النقر على "استعادة كلمة المرور" بالأسفل لتصلك رسالة إعادة التعيين.');
      } else if (msg.includes('too-many-requests')) {
        setErrorMsg('تم حظر المحاولات مؤقتاً بسبب تكرار المحاولة، يرجى الانتظار دقيقة.');
      } else {
        setErrorMsg('فشل تسجيل الدخول: تحقق من صحة كلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تتكون من 6 خانات أو رموز على الأقل.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, BOOTSTRAP_ADMIN_EMAIL, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        createdAt: new Date().toISOString()
      }, { merge: true });

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        displayName: 'مالك المنصة - المدير العام',
        role: 'admin',
        createdAt: new Date().toISOString()
      }, { merge: true });

      await logAdminAction('ADMIN_ACCOUNT_SETUP', `Admin initialized custom password`, user.email!, user.uid);
      setSuccessMsg('تم إنشاء وتعيين كلمة مرور المدير بنجاح! جاري تحويلك للوحة الإدارة...');
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: unknown) {
      console.error('Admin setup error:', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setErrorMsg('هذا الحساب مسجل بالفعل بكلمة مرور مسبقة! يرجى إدخال كلمة المرور السابقة في "تسجيل الدخول"، أو استخدام "استعادة كلمة المرور" لإعادة ضبطها.');
      } else {
        setErrorMsg('تعذر تعيين كلمة المرور: ' + (err instanceof Error ? err.message : 'خطأ غير متوقع'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
        await signOut(auth);
        setErrorMsg(`تم رفض الوصول: الحساب (${user.email}) ليس الحساب المعتمد للإدارة. يجب تسجيل الدخول بحساب: ${BOOTSTRAP_ADMIN_EMAIL}`);
        setLoading(false);
        return;
      }

      // Ensure admin document exists
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          lastLoginAt: new Date().toISOString()
        },
        { merge: true }
      );

      await logAdminAction('ADMIN_LOGIN_GOOGLE', `Admin logged in via Google OAuth`, user.email!, user.uid);
      onSuccess();
    } catch (err: unknown) {
      console.error('Google admin login error:', err);
      setErrorMsg('تم إلغاء تسجيل الدخول أو إغلاق النافذة المنبثقة.');
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
      setSuccessMsg(`تم إرسال رابط آمن لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني (${email.trim()}). يرجى فحص صندوق الوارد أو رسائل الترويج/الرسائل غير المرغوب فيها.`);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setErrorMsg('تعذر إرسال رابط الاستعادة، يرجى التأكد من صحة البريد الإلكتروني أو تعيين كلمة مرور جديدة من تبويب "تعيين كلمة مرور".');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        
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
              منطقة مخصصة حصرياً لمالك المنصة ({BOOTSTRAP_ADMIN_EMAIL})
            </p>
          </div>
        </div>

        {/* 1-Click Google Sign-In for Admin */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-md transition-all text-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>الدخول المباشر السريع بحساب Google</span>
          </button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500 uppercase">
              أو عبر كلمة المرور
            </span>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setMode('setup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'setup'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تعيين كلمة سر جديدة
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
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
                  نسيت كلمة المرور؟
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
        )}

        {/* MODE 2: FIRST-TIME PASSWORD SETUP */}
        {mode === 'setup' && (
          <form onSubmit={handleSetupAdminPassword} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
              <p>إذا لم تكن قد أنشأت كلمة مرور من قبل، أدخل هنا كلمة المرور التي ترغب في استخدامها للدخول.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                البريد الإلكتروني المعتمد للمدير
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={BOOTSTRAP_ADMIN_EMAIL}
                  dir="ltr"
                  className="w-full ps-11 pe-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-sm font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اختر كلمة المرور الجديدة (6 خانات أو أكثر)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة مرور قوية"
                  dir="ltr"
                  className="w-full ps-11 pe-11 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute top-3 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  dir="ltr"
                  className="w-full ps-11 pe-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'جاري الحفظ والتعيين...' : 'حفظ كلمة المرور والدخول للإدارة'}</span>
            </button>
          </form>
        )}

        {/* MODE 3: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                البريد الإلكتروني المسجل للمدير
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
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين إلى البريد'}
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

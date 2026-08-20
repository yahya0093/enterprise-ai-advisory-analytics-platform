"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

function EyeOpenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5.05 0 9.27 3.11 10.67 7.09a1.09 1.09 0 0 1 0 .72 11.07 11.07 0 0 1-4.11 5.09" />
      <path d="M6.61 6.61A11.05 11.05 0 0 0 1.33 12a1.09 1.09 0 0 0 0 .72 11.08 11.08 0 0 0 8.55 6.73" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("عبّي كل البيانات المطلوبة");
      return;
    }

    if (!isLogin && !username.trim()) {
      setMessage("اكتب اسم المستخدم");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        const user = data.user;

        if (!user) {
          setMessage("صار خطأ أثناء تسجيل الدخول");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_approved, username")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          setMessage("تعذر جلب بيانات الحساب");
          return;
        }

        if (!profile.is_approved) {
          await supabase.auth.signOut();
          setMessage("حسابك بانتظار التفعيل من قبل المسؤول");
          return;
        }

        window.location.href = "/";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim() },
          },
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("تم إنشاء الحساب بنجاح، بانتظار موافقة المسؤول");
          setUsername("");
          setEmail("");
          setPassword("");
          setShowPassword(false);
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("تعذر الاتصال بالخادم، حاول مرة ثانية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_20%)]" />
      <div className="absolute top-[-120px] right-[-80px] h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-140px] left-[-100px] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md rounded-[28px] border border-gray-800 bg-[#0b0b0b]/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.55)] overflow-hidden">
              <div className="px-8 pt-8 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
                      Advisory Council
                    </p>
                    <h2 className="text-3xl font-extrabold text-white">
                      {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                    </h2>
                  </div>

                  <div className="h-12 w-12 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-xl text-blue-300 shadow-lg shadow-blue-500/10">
                    {isLogin ? "🔐" : "✨"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#111] border border-gray-800 rounded-2xl p-1">
                  <button
                    onClick={() => {
                      if (loading) return;
                      setIsLogin(true);
                      setMessage("");
                      setShowPassword(false);
                    }}
                    className={`rounded-xl py-2.5 text-sm font-bold transition-all ${isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-400 hover:text-white"
                      } ${loading
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                      }`}
                  >
                    دخول
                  </button>

                  <button
                    onClick={() => {
                      if (loading) return;
                      setIsLogin(false);
                      setMessage("");
                      setShowPassword(false);
                    }}
                    className={`rounded-xl py-2.5 text-sm font-bold transition-all ${!isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-400 hover:text-white"
                      } ${loading
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                      }`}
                  >
                    حساب جديد
                  </button>
                </div>
              </div>

              <div className="px-8 py-7">
                {message && (
                  <div className="mb-5 rounded-2xl border border-gray-800 bg-[#111] px-4 py-3 text-sm text-center text-gray-200">
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        اسم المستخدم
                      </label>
                      <input
                        type="text"
                        placeholder="اكتب اسم المستخدم"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      كلمة المرور
                    </label>

                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAuth();
                        }}
                        
                        className="w-full bg-black border border-gray-700 rounded-2xl pr-4 pl-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-right"
                      />

                      {/* زر العين */}
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        /* وضعناه في أقصى اليسار absolute left-2 */
                        className="absolute left-2 h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer z-20"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 px-4 py-3 text-sm text-blue-200 leading-7">
                      بعد إنشاء الحساب، سيبقى الحساب بانتظار موافقة المسؤول قبل
                      تسجيل الدخول.
                    </div>
                  )}

                  <button
                    onClick={handleAuth}
                    disabled={loading}
                    className={`w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.99] ${loading ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                  >
                    {loading
                      ? "جاري المعالجة..."
                      : isLogin
                        ? "دخول إلى النظام"
                        : "إنشاء الحساب"}
                  </button>
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="text-center text-sm text-gray-500">
                  {isLogin ? "ما عندك حساب؟" : "عندك حساب بالفعل؟"}{" "}
                  <button
                    onClick={() => {
                      if (loading) return;
                      setIsLogin(!isLogin);
                      setMessage("");
                      setShowPassword(false);
                    }}
                    className={`text-blue-400 hover:text-blue-300 font-bold transition-colors ${loading
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                      }`}
                  >
                    {isLogin ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col justify-center pr-6">
            <div className="inline-flex items-center gap-2 w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 mb-6">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              منصة المجلس الاستشاري
            </div>

            <h1 className="text-5xl font-extrabold leading-tight mb-5">
              وصول ذكي
              <br />
              إلى <span className="text-blue-400">مجلس الاستشارة</span>
            </h1>

            <p className="text-gray-400 text-lg leading-8 max-w-xl mb-8">
              منصة موحدة للوصول إلى المعلومات عبر مستشارين متخصصين، بإجابات
              دقيقة وواضحة وسريعة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-2xl border border-gray-800 bg-[#0d0d0d]/80 p-5 backdrop-blur-xl">
                <p className="text-sm text-gray-400 mb-2">للإدارة والقيادة</p>
                <h3 className="font-bold text-white mb-2">
                  رؤية أوضح وقرارات أسرع
                </h3>
                <p className="text-sm text-gray-500 leading-7">
                  الوصول السريع إلى إجابات مرتبطة بسياق الشركة وملفاتها، بما
                  يدعم الإدارة في المتابعة واتخاذ القرار بثقة أكبر.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-[#0d0d0d]/80 p-5 backdrop-blur-xl">
                <p className="text-sm text-gray-400 mb-2">
                  للموظفين المخولين
                </p>
                <h3 className="font-bold text-white mb-2">
                  إجابات دقيقة حسب التخصص
                </h3>
                <p className="text-sm text-gray-500 leading-7">
                  كل مستشار يجيب وفق مجاله، مع الاعتماد على المعرفة الداخلية
                  للشركة لتسهيل العمل اليومي وتقليل الرجوع اليدوي للملفات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
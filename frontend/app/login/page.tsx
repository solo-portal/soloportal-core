"use client";

import { useState, useLayoutEffect, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  slug: string;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [mode, setMode] = useState<"register" | "login">("register");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "login") {
      setMode("login");
    } else if (urlMode === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("لطفاً ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    if (mode === "register" && (!fullName.trim() || !slug.trim())) {
      setErrorMsg("لطفاً نام و نام خانوادگی و اسلاگ اختصاصی پورتال را وارد کنید.");
      return;
    }

    setIsLoading(true);
    try {
      // ۱. اگر در حالت ثبت‌نام هستیم، ابتدا کاربر را در بک‌اند می‌سازیم
      if (mode === "register") {
        await apiRequest("/users", {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            full_name: fullName.trim(),
            slug: slug.trim(),
            password: password,
          }),
        });
      }

      // ۲. لاگین و دریافت توکن JWT
      const tokenData = await apiRequest<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      localStorage.setItem("soloportal_token", tokenData.access_token);

      // ۳. دریافت اطلاعات پروفایل کاربر لاگین‌شده از بک‌اند
      const me = await apiRequest<UserProfile>("/auth/me", { method: "GET" }, true);
      localStorage.setItem(
        "soloportal_demo_user",
        JSON.stringify({
          id: me.id,
          fullName: me.full_name,
          email: me.email,
          slug: me.slug,
        })
      );

      // ۴. هدایت به مسیر redirect (در صورت وجود) یا داشبورد
      const redirectPath = searchParams.get("redirect");
      if (redirectPath && redirectPath.startsWith("/")) {
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("خطا در احراز هویت. لطفاً اطلاعات را بررسی کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#04222B]" />;
  }

  return (
    <div
      dir="rtl"
      className={
        isDark
          ? "min-h-screen bg-gradient-to-br from-[#04222B] via-[#0A3D4A] to-[#10606F] text-[#E2F4F0] font-sans relative overflow-x-hidden flex flex-col justify-between"
          : "min-h-screen bg-gradient-to-br from-[#E2F4F0] via-[#F2F8F6] to-[#98D8D0]/30 text-[#04222B] font-sans relative overflow-x-hidden flex flex-col justify-between"
      }
    >
      <div
        className={
          isDark
            ? "absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#1D8B94]/25"
            : "absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#98D8D0]/35"
        }
      ></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#4FB8B4]/15"></div>

      {/* هدر */}
      <header
        className={
          isDark
            ? "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/10 bg-[#04222B]/65"
            : "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/60 bg-white/80"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div
              className={
                isDark
                  ? "w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-lg bg-white/10 border-white/20 text-[#98D8D0]"
                  : "w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-lg bg-[#1D8B94]/10 border-[#1D8B94]/20 text-[#1D8B94]"
              }
            >
              س
            </div>
            <span
              className={
                isDark
                  ? "text-xl font-bold tracking-tight text-white"
                  : "text-xl font-bold tracking-tight text-[#04222B]"
              }
            >
              سولو<span className={isDark ? "text-[#98D8D0]" : "text-[#1D8B94]"}>پورتال</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
              className={
                isDark
                  ? "p-2.5 rounded-xl border cursor-pointer flex items-center justify-center bg-white/10 hover:bg-white/20 border-white/20 text-amber-300 transition"
                  : "p-2.5 rounded-xl border cursor-pointer flex items-center justify-center bg-white hover:bg-[#E2F4F0] border-[#1D8B94]/25 text-[#1D8B94] transition"
              }
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <a
              href="/"
              className={
                isDark
                  ? "text-xs sm:text-sm font-medium px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[#E2F4F0] transition"
                  : "text-xs sm:text-sm font-medium px-4 py-2 rounded-xl border border-[#1D8B94]/25 bg-white hover:bg-[#E2F4F0] text-[#04222B] transition"
              }
            >
              بازگشت به صفحه اصلی
            </a>
          </div>
        </div>
      </header>

      {/* کارت مرکزی ورود و ثبت‌نام */}
      <main className="max-w-md w-full mx-auto px-6 py-12 relative z-10">
        <div
          className={
            isDark
              ? "border p-7 sm:p-8 rounded-3xl backdrop-blur-xl bg-[#04222B]/75 border-white/15 shadow-2xl space-y-6"
              : "border p-7 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/90 border-white shadow-xl space-y-6"
          }
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1D8B94] text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
              س
            </div>
            <h1 className={isDark ? "text-xl font-extrabold text-white pt-1" : "text-xl font-extrabold text-[#04222B] pt-1"}>
              {mode === "register" ? "ایجاد حساب کاربری" : "ورود به حساب کاربری"}
            </h1>
            <p className={isDark ? "text-xs text-[#98D8D0]/85" : "text-xs text-[#0A3D4A]/80"}>
              {mode === "register"
                ? "برای استفاده از پورتال مدیریت جلسات یا رزرو نوبت ثبت‌نام کنید"
                : "برای دسترسی به پنل یا تکمیل رزرو وارد حساب خود شوید"}
            </p>
          </div>

          <div
            className={
              isDark
                ? "grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10"
                : "grid grid-cols-2 p-1 rounded-2xl bg-[#E2F4F0] border border-[#98D8D0]/40"
            }
          >
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              className={
                mode === "register"
                  ? "py-2 rounded-xl text-xs font-bold bg-[#1D8B94] text-white shadow cursor-pointer transition"
                  : isDark
                  ? "py-2 rounded-xl text-xs font-medium text-[#98D8D0] hover:text-white cursor-pointer transition"
                  : "py-2 rounded-xl text-xs font-medium text-[#0A3D4A] hover:text-black cursor-pointer transition"
              }
            >
              ثبت‌نام
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={
                mode === "login"
                  ? "py-2 rounded-xl text-xs font-bold bg-[#1D8B94] text-white shadow cursor-pointer transition"
                  : isDark
                  ? "py-2 rounded-xl text-xs font-medium text-[#98D8D0] hover:text-white cursor-pointer transition"
                  : "py-2 rounded-xl text-xs font-medium text-[#0A3D4A] hover:text-black cursor-pointer transition"
              }
            >
              ورود
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {mode === "register" && (
              <div>
                <label className={isDark ? "block text-xs font-semibold text-[#E2F4F0] mb-1.5" : "block text-xs font-semibold text-[#04222B] mb-1.5"}>
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثلاً: شقایق خوبکار"
                  className={
                    isDark
                      ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4]"
                      : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94]"
                  }
                />
              </div>
            )}

            <div>
              <label className={isDark ? "block text-xs font-semibold text-[#E2F4F0] mb-1.5" : "block text-xs font-semibold text-[#04222B] mb-1.5"}>
                نشانی ایمیل
              </label>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={
                  isDark
                    ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4] text-left"
                    : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94] text-left"
                }
              />
            </div>

            {mode === "register" && (
              <div>
                <label className={isDark ? "block text-xs font-semibold text-[#E2F4F0] mb-1.5" : "block text-xs font-semibold text-[#04222B] mb-1.5"}>
                  اسلاگ یکتا (آدرس اختصاصی پورتال)
                </label>
                <div
                  dir="ltr"
                  className={
                    isDark
                      ? "flex items-center rounded-xl border bg-white/5 border-white/15 overflow-hidden focus-within:border-[#4FB8B4]"
                      : "flex items-center rounded-xl border bg-white border-[#98D8D0]/60 overflow-hidden focus-within:border-[#1D8B94]"
                  }
                >
                  <span className={isDark ? "px-3 text-xs text-[#98D8D0]/70 bg-white/5 py-2.5 border-r border-white/10" : "px-3 text-xs text-[#1D8B94] bg-[#E2F4F0]/60 py-2.5 border-r border-[#98D8D0]/40"}>
                    /book/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="shaghayegh"
                    className={
                      isDark
                        ? "w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
                        : "w-full px-3 py-2.5 bg-transparent text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none"
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <label className={isDark ? "block text-xs font-semibold text-[#E2F4F0] mb-1.5" : "block text-xs font-semibold text-[#04222B] mb-1.5"}>
                رمز عبور
              </label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={
                  isDark
                    ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4] text-left"
                    : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94] text-left"
                }
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-sm bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-60 text-white shadow-lg cursor-pointer transition mt-2"
            >
              {isLoading
                ? "در حال پردازش..."
                : mode === "register"
                ? "ثبت‌نام و ساخت پورتال"
                : "ورود به حساب"}
            </button>
          </form>

          <div
            className={
              isDark
                ? "pt-4 border-t border-white/10 text-center"
                : "pt-4 border-t border-[#98D8D0]/40 text-center"
            }
          >
            <a
              href="/book/shaghayegh"
              className={
                isDark
                  ? "text-xs text-[#98D8D0] hover:text-white underline underline-offset-4 transition"
                  : "text-xs text-[#1D8B94] hover:text-[#04222B] underline underline-offset-4 transition"
              }
            >
              حالت آزمایشی: ورود مستقیم به پورتال رزرو مهمان
            </a>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-xs opacity-70 relative z-10">
        © ۱۴۰۵ سولوپورتال (SoloPortal)
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04222B]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
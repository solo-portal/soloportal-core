"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpecialistUser {
  id?: string | number;
  full_name: string;
  headline?: string | null;
  slug: string;
  bio?: string | null;
}

interface StoredUser {
  fullName?: string;
  slug?: string;
}

const API_BASE_URL = "http://127.0.0.1:8001";

export default function SpecialistsSearchPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SpecialistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }

    const token = localStorage.getItem("soloportal_token");
    const userRaw = localStorage.getItem("soloportal_demo_user");
    if (token && userRaw) {
      try {
        setCurrentUser(JSON.parse(userRaw));
      } catch {
        setCurrentUser(null);
      }
    }
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("soloportal_token");
    localStorage.removeItem("soloportal_demo_user");
    setCurrentUser(null);
    router.refresh();
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const trimmed = query.trim();
        const url = trimmed
          ? `${API_BASE_URL}/api/v1/users?q=${encodeURIComponent(trimmed)}`
          : `${API_BASE_URL}/api/v1/users`;

        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("خطا در دریافت لیست متخصصان");
        }

        const data = await res.json();
        let list: SpecialistUser[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.items)) {
          list = data.items;
        } else if (Array.isArray(data.users)) {
          list = data.users;
        }
        setUsers(list);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setError("امکان برقراری ارتباط با سرور وجود ندارد.");
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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
      {/* افکت نوری پس‌زمینه */}
      <div
        className={
          isDark
            ? "absolute top-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#1D8B94]/25"
            : "absolute top-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#98D8D0]/35"
        }
      />

      {/* هدر یکپارچه */}
      <header
        className={
          isDark
            ? "w-full border-b backdrop-blur-md sticky top-0 z-40 border-white/10 bg-[#04222B]/80"
            : "w-full border-b backdrop-blur-md sticky top-0 z-40 border-white/60 bg-white/85"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
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
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser ? (
              <>
                <span className={isDark ? "hidden sm:inline text-xs text-[#98D8D0] ml-1" : "hidden sm:inline text-xs text-[#0A3D4A] ml-1"}>
                  سلام، <strong>{currentUser.fullName}</strong>
                </span>
                <Link
                  href="/dashboard?tab=my-bookings"
                  className={
                    isDark
                      ? "text-xs font-medium px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-[#E2F4F0] transition"
                      : "text-xs font-medium px-3.5 py-2 rounded-xl border border-[#1D8B94]/25 bg-white hover:bg-[#E2F4F0] text-[#04222B] transition"
                  }
                >
                  نوبت‌های من
                </Link>
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-sm transition"
                >
                  پنل کاربری
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={
                    isDark
                      ? "text-xs px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 cursor-pointer transition"
                      : "text-xs px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 cursor-pointer transition"
                  }
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?mode=login&redirect=/book"
                  className={
                    isDark
                      ? "text-xs font-medium px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-[#E2F4F0] transition"
                      : "text-xs font-medium px-4 py-2 rounded-xl border border-[#1D8B94]/25 bg-white hover:bg-[#E2F4F0] text-[#04222B] transition"
                  }
                >
                  ورود
                </Link>
                <Link
                  href="/login?mode=register"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-sm transition"
                >
                  شروع رایگان
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
              className={
                isDark
                  ? "p-2 rounded-xl border cursor-pointer flex items-center justify-center bg-white/10 hover:bg-white/20 border-white/20 text-amber-300 transition"
                  : "p-2 rounded-xl border cursor-pointer flex items-center justify-center bg-white hover:bg-[#E2F4F0] border-[#1D8B94]/25 text-[#1D8B94] transition"
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
          </div>
        </div>
      </header>

      {/* بخش جستجو و کارت‌ها */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 relative z-10 flex-1">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span
            className={
              isDark
                ? "inline-block text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#98D8D0]"
                : "inline-block text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#1D8B94]/10 border border-[#1D8B94]/20 text-[#1D8B94]"
            }
          >
            دایرکتوری مشاوران و متخصصان
          </span>

          <h1
            className={
              isDark
                ? "text-2xl sm:text-4xl font-extrabold tracking-tight text-white"
                : "text-2xl sm:text-4xl font-extrabold tracking-tight text-[#04222B]"
            }
          >
            جستجو و رزرو نوبت آنلاین
          </h1>

          <p className={isDark ? "text-xs sm:text-sm text-[#98D8D0]/85" : "text-xs sm:text-sm text-[#0A3D4A]/80"}>
            نام مشاور، استاد، آموزشگاه یا شناسه اختصاصی را جستجو کنید و زمان جلسه خود را رزرو نمایید.
          </p>

          <div className="relative pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، عنوان تخصصی یا اسلاگ..."
              className={
                isDark
                  ? "w-full rounded-2xl border border-white/15 bg-[#04222B]/80 backdrop-blur-xl px-5 py-4 pr-12 text-sm text-white placeholder:text-white/40 shadow-xl outline-none transition focus:border-[#4FB8B4]"
                  : "w-full rounded-2xl border border-[#98D8D0]/70 bg-white/95 backdrop-blur-xl px-5 py-4 pr-12 text-sm text-[#04222B] placeholder:text-[#04222B]/40 shadow-lg outline-none transition focus:border-[#1D8B94]"
              }
            />
            <svg
              className={
                isDark
                  ? "pointer-events-none absolute right-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[#98D8D0]/70"
                  : "pointer-events-none absolute right-4 top-1/2 mt-1 h-5 w-5 -translate-y-1/2 text-[#1D8B94]/70"
              }
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className={
                  isDark
                    ? "absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-xs font-medium text-[#98D8D0] hover:text-white cursor-pointer"
                    : "absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-xs font-medium text-[#1D8B94] hover:text-[#04222B] cursor-pointer"
                }
              >
                پاک کردن
              </button>
            )}
          </div>
        </div>

        {/* نتایج جستجو */}
        <div className="mt-12">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={
                    isDark
                      ? "h-48 animate-pulse rounded-3xl border border-white/10 bg-[#04222B]/60 p-6"
                      : "h-48 animate-pulse rounded-3xl border border-white bg-white/80 p-6"
                  }
                >
                  <div className="h-5 w-2/3 rounded bg-white/10" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
                  <div className="mt-10 h-9 w-full rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/15 p-6 text-center text-sm text-rose-300">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div
              className={
                isDark
                  ? "rounded-3xl border border-white/15 bg-[#04222B]/70 backdrop-blur-xl p-10 text-center space-y-2"
                  : "rounded-3xl border border-white bg-white/90 backdrop-blur-xl p-10 text-center space-y-2 shadow-md"
              }
            >
              <p className={isDark ? "text-base font-bold text-white" : "text-base font-bold text-[#04222B]"}>
                متخصصی با این مشخصات پیدا نشد
              </p>
              <p className="text-xs opacity-75">
                عبارت جستجو را تغییر دهید یا فیلتر را پاک کنید تا همه متخصصان نمایش داده شوند.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((specialist) => (
                <Link
                  key={specialist.slug}
                  href={`/book/${specialist.slug}`}
                  className={
                    isDark
                      ? "group flex flex-col justify-between rounded-3xl border border-white/15 bg-[#04222B]/75 backdrop-blur-xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#4FB8B4]/60"
                      : "group flex flex-col justify-between rounded-3xl border border-white bg-white/90 backdrop-blur-xl p-6 shadow-md transition hover:-translate-y-1 hover:border-[#1D8B94]/50 hover:shadow-xl"
                  }
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1D8B94] text-lg font-bold text-white shadow-md">
                        {specialist.full_name ? specialist.full_name.charAt(0) : "س"}
                      </div>
                      <span
                        dir="ltr"
                        className={
                          isDark
                            ? "rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-medium text-[#98D8D0]"
                            : "rounded-full bg-[#E2F4F0] border border-[#98D8D0]/50 px-3 py-1 text-xs font-medium text-[#1D8B94]"
                        }
                      >
                        @{specialist.slug}
                      </span>
                    </div>

                    <h2
                      className={
                        isDark
                          ? "mt-4 text-lg font-extrabold text-white group-hover:text-[#98D8D0] transition"
                          : "mt-4 text-lg font-extrabold text-[#04222B] group-hover:text-[#1D8B94] transition"
                      }
                    >
                      {specialist.full_name}
                    </h2>

                    <p
                      className={
                        isDark
                          ? "mt-1.5 line-clamp-2 text-xs sm:text-sm text-[#E2F4F0]/75 leading-relaxed"
                          : "mt-1.5 line-clamp-2 text-xs sm:text-sm text-[#0A3D4A]/80 leading-relaxed"
                      }
                    >
                      {specialist.headline ? specialist.headline : "مشاور و متخصص در سولوپورتال"}
                    </p>
                  </div>

                  <div
                    className={
                      isDark
                        ? "mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs sm:text-sm font-bold text-[#98D8D0]"
                        : "mt-6 flex items-center justify-between border-t border-[#98D8D0]/40 pt-4 text-xs sm:text-sm font-bold text-[#1D8B94]"
                    }
                  >
                    <span>مشاهده خدمات و رزرو نوبت</span>
                    <span className="transition-transform group-hover:-translate-x-1">
                      ←
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-5 text-center text-xs opacity-70 relative z-10">
        ©️۱۴۰۵ سولوپورتال (SoloPortal)
      </footer>
    </div>
  );
}
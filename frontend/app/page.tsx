"use client";

import { useState, useRef, useLayoutEffect } from "react";

interface ServiceItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  duration: string;
  price: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "strategy",
    tag: "پرفروش",
    title: "مشاوره استراتژی کسب‌وکار",
    subtitle: "۶۰ دقیقه جلسه ویدیویی آنلاین",
    duration: "۶۰",
    price: "۸۵۰,۰۰۰ تومان",
  },
  {
    id: "roadmap",
    tag: "عمیق و جامع",
    title: "برنامه‌ریزی و تدوین رودمپ",
    subtitle: "۹۰ دقیقه جلسه تخصصی و تحلیل",
    duration: "۹۰",
    price: "۱,۲۰۰,۰۰۰ تومان",
  },
  {
    id: "followup",
    tag: "سریع",
    title: "جلسه پیگیری و رفع اشکال",
    subtitle: "۳۰ دقیقه بررسی وضعیت پیشرفت",
    duration: "۳۰",
    price: "۴۵۰,۰۰۰ تومان",
  },
];

export default function HomePage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }
    setIsMounted(true);
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("strategy");
  const [selectedTime, setSelectedTime] = useState<string>("۱۰:۳۰");
  const [showMoreTimes, setShowMoreTimes] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState<string>("۶۰");
  const [showCustomSettings, setShowCustomSettings] = useState<boolean>(false);
  const [customTimeInput, setCustomTimeInput] = useState<string>("18:30");
  const [customTimesList, setCustomTimesList] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const initialTimes = ["۰۹:۰۰", "۱۰:۳۰", "۱۲:۰۰", "۱۵:۰۰"];
  const extraTimes = ["۱۶:۳۰", "۱۸:۰۰", "۱۹:۳۰", "۲۱:۰۰"];
  const presetDurations = ["۱۵", "۳۰", "۴۵", "۶۰", "۹۰"];

  const baseTimes = showMoreTimes ? [...initialTimes, ...extraTimes] : initialTimes;
  const displayedTimes = [...baseTimes, ...customTimesList];

  const selectedService =
    SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  const toPersianDigits = (str: string) =>
    str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceId(service.id);
    setDuration(service.duration);
    setBookingSuccess(false);
  };

  const handleAddCustomTime = () => {
    if (!customTimeInput) return;
    const formattedTime = toPersianDigits(customTimeInput);
    if (!displayedTimes.includes(formattedTime)) {
      setCustomTimesList([...customTimesList, formattedTime]);
    }
    setSelectedTime(formattedTime);
    setBookingSuccess(false);
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[#04222B]" />;
  }

  return (
    <div
      dir="rtl"
      className={
        isDark
          ? "min-h-screen bg-gradient-to-br from-[#04222B] via-[#0A3D4A] to-[#10606F] text-[#E2F4F0] font-sans relative overflow-x-hidden"
          : "min-h-screen bg-gradient-to-br from-[#E2F4F0] via-[#F2F8F6] to-[#98D8D0]/30 text-[#04222B] font-sans relative overflow-x-hidden"
      }
    >
      {/* هاله‌های نوری پس‌زمینه */}
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
            ? "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/10 bg-[#04222B]/65 shadow-lg"
            : "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/60 bg-white/80 shadow-sm"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-3 shrink-0">
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
                    ? "text-xl font-bold tracking-tight text-white whitespace-nowrap"
                    : "text-xl font-bold tracking-tight text-[#04222B] whitespace-nowrap"
                }
              >
                سولو<span className={isDark ? "text-[#98D8D0]" : "text-[#1D8B94]"}>پورتال</span>
              </span>
            </a>

            <nav
              className={
                isDark
                  ? "hidden md:flex items-center gap-7 text-sm font-medium text-[#98D8D0]/90 whitespace-nowrap"
                  : "hidden md:flex items-center gap-7 text-sm font-medium text-[#0A3D4A]/90 whitespace-nowrap"
              }
            >
              <a href="#features" className="hover:opacity-75 transition">ویژگی‌ها</a>
              <a href="#demo-preview" className="hover:opacity-75 transition">نحوه کارکرد</a>
              <a href="#demo-preview" className="hover:opacity-75 transition">تعرفه‌ها</a>
              <a href="#features" className="hover:opacity-75 transition">پرسش‌های متداول</a>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
              href="/login?mode=login"
              className={
                isDark
                  ? "text-sm font-medium px-4 py-2 text-[#E2F4F0]/90 hover:text-white whitespace-nowrap transition"
                  : "text-sm font-medium px-4 py-2 text-[#0A3D4A] hover:text-black whitespace-nowrap transition"
              }
            >
              ورود
            </a>
            <a
              href="/login?mode=register"
              className="text-sm font-bold px-5 py-2.5 rounded-2xl bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-md whitespace-nowrap transition"
            >
              شروع رایگان
            </a>
          </div>
        </div>
      </header>

      {/* بخش هیرو وسط‌چین */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center relative z-10 space-y-6">
        <div
          className={
            isDark
              ? "inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 border-white/20 text-[#98D8D0]"
              : "inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-semibold bg-white/85 border-[#1D8B94]/20 text-[#1D8B94] shadow-sm"
          }
        >
          <span className="w-2 h-2 rounded-full animate-pulse bg-[#4FB8B4]"></span>
          پلتفرم اختصاصی برای فریلنسرها و مشاوران
        </div>

        <h1
          className={
            isDark
              ? "text-3xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight tracking-tight text-white"
              : "text-3xl sm:text-5xl lg:text-[52px] font-extrabold leading-tight tracking-tight text-[#04222B]"
          }
        >
          جلسات کاری خود را بدون پیام‌های رفت‌وبرگشتی، <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FB8B4] via-[#98D8D0] to-[#1D8B94]">
            هوشمند و خودکار تنظیم کنید
          </span>
        </h1>

        <p
          className={
            isDark
              ? "text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto text-[#E2F4F0]/80"
              : "text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto text-[#0A3D4A]/90"
          }
        >
          لینک اختصاصی خود را بسازید، خدمات و بازه‌های زمانی خالی را تعریف کنید و اجازه دهید مراجعان به سادگی و بدون تداخل، جلسه آنلاین خود را رزرو کنند.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="/book/shaghayegh"
            className="font-bold px-7 py-3.5 rounded-2xl flex items-center gap-2.5 bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            مشاهده دمو رزرو زنده (Live Demo)
          </a>

          <a
            href="/dashboard"
            className={
              isDark
                ? "font-semibold px-7 py-3.5 rounded-2xl border flex items-center gap-2 bg-white/10 hover:bg-white/15 text-[#E2F4F0] border-white/20 transition"
                : "font-semibold px-7 py-3.5 rounded-2xl border flex items-center gap-2 bg-white/85 hover:bg-white text-[#04222B] border-[#1D8B94]/25 shadow-sm transition"
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            ورود به داشبورد فریلنسر
          </a>
        </div>
      </section>

      {/* کارت پیش‌نمایش رزرو زنده */}
      <section id="demo-preview" className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <div
          className={
            isDark
              ? "border p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-[#04222B]/70 border-white/15 shadow-2xl space-y-6"
              : "border p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/85 border-white shadow-xl space-y-6"
          }
        >
          <div
            className={
              isDark
                ? "flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-white/10"
                : "flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-[#98D8D0]/40"
            }
          >
            <div className="flex items-center gap-3.5">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="کلیک برای تغییر عکس پروفایل"
                className="w-12 h-12 rounded-2xl border bg-[#1D8B94] border-white/30 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm shrink-0"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-base">ش</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>

              <div className="text-right">
                <h2 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
                  شقایق خوبکار
                </h2>
                <p className={isDark ? "text-xs text-[#98D8D0]" : "text-xs text-[#1D8B94]"}>
                  مشاور و برنامه‌ریز تحصیلی • لینک اختصاصی: soloportal.ir/book/shaghayegh
                </p>
              </div>
            </div>

            <span
              className={
                isDark
                  ? "text-xs px-3.5 py-1.5 rounded-full font-semibold border bg-[#1D8B94]/25 text-[#98D8D0] border-[#4FB8B4]/30"
                  : "text-xs px-3.5 py-1.5 rounded-full font-semibold border bg-[#1D8B94]/10 text-[#1D8B94] border-[#1D8B94]/25"
              }
            >
              وقت‌های آزاد این هفته
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={
                    isSelected
                      ? isDark
                        ? "p-5 rounded-2xl border-2 border-[#4FB8B4] bg-[#1D8B94]/20 text-right flex flex-col justify-between gap-5 cursor-pointer transition shadow-lg"
                        : "p-5 rounded-2xl border-2 border-[#1D8B94] bg-[#E2F4F0]/90 text-right flex flex-col justify-between gap-5 cursor-pointer transition shadow-md"
                      : isDark
                      ? "p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-right flex flex-col justify-between gap-5 cursor-pointer transition"
                      : "p-5 rounded-2xl border border-[#98D8D0]/50 bg-white/75 hover:bg-white text-right flex flex-col justify-between gap-5 cursor-pointer transition"
                  }
                >
                  <div className="space-y-2.5">
                    <span
                      className={
                        isDark
                          ? "inline-block text-[11px] px-2.5 py-0.5 rounded-lg bg-white/10 text-[#98D8D0]"
                          : "inline-block text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1D8B94]/10 text-[#1D8B94] font-medium"
                      }
                    >
                        {service.tag}
                    </span>
                    <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
                      {service.title}
                    </h3>
                    <p className={isDark ? "text-xs text-[#E2F4F0]/70" : "text-xs text-[#0A3D4A]/80"}>
                      {service.subtitle}
                    </p>
                  </div>

                  <div
                    className={
                      isDark
                        ? "pt-3 border-t border-white/10 flex items-center justify-between"
                        : "pt-3 border-t border-[#98D8D0]/40 flex items-center justify-between"
                    }
                  >
                    <span className={isDark ? "text-sm font-bold text-[#98D8D0]" : "text-sm font-bold text-[#04222B]"}>
                      {service.price}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectService(service);
                      }}
                      className={
                        isSelected
                          ? "text-xs font-bold px-4 py-1.5 rounded-xl bg-[#1D8B94] text-white shadow cursor-pointer"
                          : isDark
                          ? "text-xs font-semibold px-4 py-1.5 rounded-xl bg-white/10 hover:bg-[#1D8B94] text-white cursor-pointer transition"
                          : "text-xs font-semibold px-4 py-1.5 rounded-xl bg-[#1D8B94]/15 hover:bg-[#1D8B94] text-[#04222B] hover:text-white cursor-pointer transition"
                      }
                    >
                      {isSelected ? "انتخاب شد ✓" : "انتخاب"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={
              isDark
                ? "p-5 rounded-2xl border bg-white/5 border-white/10 space-y-4"
                : "p-5 rounded-2xl border bg-[#E2F4F0]/50 border-[#98D8D0]/50 space-y-4"
            }
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={isDark ? "text-xs sm:text-sm font-semibold text-white" : "text-xs sm:text-sm font-semibold text-[#04222B]"}>
                ساعت‌های آزاد برای «{selectedService.title}» ({duration} دقیقه):
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMoreTimes(!showMoreTimes)}
                  className={
                    isDark
                      ? "text-xs text-[#98D8D0] hover:text-white cursor-pointer underline underline-offset-4"
                      : "text-xs text-[#1D8B94] hover:text-[#04222B] cursor-pointer underline underline-offset-4"
                  }
                >
                  {showMoreTimes ? "ساعت‌های کمتر" : "+ ساعت‌های بیشتر"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
                  className={
                    isDark
                      ? "text-xs px-3 py-1.5 rounded-xl bg-[#1D8B94]/35 hover:bg-[#1D8B94]/60 text-white border border-white/20 cursor-pointer transition"
                      : "text-xs px-3 py-1.5 rounded-xl bg-[#1D8B94]/15 hover:bg-[#1D8B94]/25 text-[#04222B] border border-[#1D8B94]/30 cursor-pointer transition"
                  }
                >
                  {showCustomSettings ? "بستن تنظیم دستی" : "⚙️ زمان و مدت دلخواه"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {displayedTimes.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setBookingSuccess(false);
                    }}
                    className={
                      isSelected
                        ? "text-white text-center py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] border border-[#4FB8B4] shadow-md cursor-pointer"
                        : isDark
                        ? "border text-center py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 text-[#98D8D0] border-white/10 cursor-pointer transition"
                        : "border text-center py-2.5 rounded-xl text-xs font-medium bg-white hover:bg-[#E2F4F0] text-[#1D8B94] border-[#98D8D0]/50 cursor-pointer transition"
                    }
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {showCustomSettings && (
              <div
                className={
                  isDark
                    ? "p-4 rounded-xl border bg-[#04222B]/70 border-white/15 space-y-4 text-xs"
                    : "p-4 rounded-xl border bg-white border-[#98D8D0]/50 space-y-4 text-xs shadow-sm"
                }
              >
                <div className="space-y-2">
                  <label className="font-semibold block">انتخاب مدت زمان جلسه (دقیقه):</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {presetDurations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={
                          duration === d
                            ? "px-3 py-1.5 rounded-lg font-bold bg-[#1D8B94] text-white cursor-pointer"
                            : isDark
                            ? "px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#98D8D0] cursor-pointer"
                            : "px-3 py-1.5 rounded-lg bg-[#E2F4F0] hover:bg-[#98D8D0]/40 text-[#04222B] cursor-pointer"
                        }
                      >
                        {d} دقیقه
                      </button>
                    ))}
                    <input
                      type="number"
                      min="5"
                      max="300"
                      placeholder="مدت دلخواه..."
                      onChange={(e) => {
                        if (e.target.value) setDuration(toPersianDigits(e.target.value));
                      }}
                      className={
                        isDark
                          ? "w-28 px-2.5 py-1.5 rounded-lg border bg-[#04222B] border-white/20 text-white placeholder:text-white/40 focus:outline-none"
                          : "w-28 px-2.5 py-1.5 rounded-lg border bg-white border-[#98D8D0] text-[#04222B] placeholder:text-[#04222B]/40 focus:outline-none"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="font-semibold block">تعیین ساعت دلخواه جلسه:</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      value={customTimeInput}
                      onChange={(e) => setCustomTimeInput(e.target.value)}
                      className={
                        isDark
                          ? "px-3 py-1.5 rounded-lg border bg-[#04222B] border-white/20 text-white focus:outline-none cursor-pointer"
                          : "px-3 py-1.5 rounded-lg border bg-white border-[#98D8D0] text-[#04222B] focus:outline-none cursor-pointer"
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTime}
                      className="px-4 py-1.5 rounded-lg font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white cursor-pointer transition shadow-sm"
                    >
                      افزودن و انتخاب این ساعت
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              className={
                isDark
                  ? "pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#98D8D0] border-t border-white/10"
                  : "pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0A3D4A] border-t border-[#98D8D0]/40"
              }
            >
              <span>
                انتخاب فعلی:{" "}
                <strong className={isDark ? "text-white" : "text-[#04222B]"}>
                  {selectedService.title} — ساعت {selectedTime} ({duration} دقیقه)
                </strong>
              </span>

              <button
                type="button"
                onClick={() => setBookingSuccess(true)}
                className="px-5 py-2 rounded-xl font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow cursor-pointer transition"
              >
                {bookingSuccess ? "✓ رزرو آزمایشی ثبت شد" : "تست ثبت این نوبت"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* بخش ۴ کارته */}
      <section
        id="features"
        className={
          isDark
            ? "max-w-7xl mx-auto px-6 py-20 border-t relative z-10 border-white/10"
            : "max-w-7xl mx-auto px-6 py-20 border-t relative z-10 border-white/60"
        }
      >
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2
            className={
              isDark
                ? "text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
                : "text-2xl sm:text-3xl font-extrabold tracking-tight text-[#04222B]"
            }
          >
            چرا متخصصان مستقل سولوپورتال را انتخاب می‌کنند؟
          </h2>
          <p
            className={
              isDark
                ? "text-sm sm:text-base text-[#E2F4F0]/80"
                : "text-sm sm:text-base text-[#0A3D4A]/80"
            }
          >
            تمام ابزارهایی که برای اتوماسیون جلسات و رشد کسب‌وکار مستقل خود نیاز دارید.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={
              isDark
                ? "border p-7 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg transition"
                : "border p-7 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md transition"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-white/10 border-white/20 text-[#98D8D0] transition"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-[#98D8D0]/30 border-white text-[#1D8B94] transition"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              تقویم شمسی جلالی
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              پشتیبانی کامل از تاریخ شمسی و روزهای هفته ایران، با رابط کاربری بهینه‌شده برای تقویم جلالی.
            </p>
          </div>

          <div
            className={
              isDark
                ? "border p-7 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg transition"
                : "border p-7 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md transition"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-white/10 border-white/20 text-[#98D8D0] transition"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-[#98D8D0]/30 border-white text-[#1D8B94] transition"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              جلوگیری از رزرو دوگانه
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              قفل همزمانی در سطح پایگاه داده و جلوگیری قطعی از رزرو همزمان یک بازه زمانی توسط دو مراجع.
            </p>
          </div>

          <div
            className={
              isDark
                ? "border p-7 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg transition"
                : "border p-7 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md transition"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-white/10 border-white/20 text-[#98D8D0] transition"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-[#98D8D0]/30 border-white text-[#1D8B94] transition"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              پورتال رزرو با اسلاگ یکتا
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              آدرس اختصاصی مثل soloportal.ir/book/shaghayegh برای اشتراک‌گذاری مستقیم در شبکه‌های اجتماعی.
            </p>
          </div>

          <div
            className={
              isDark
                ? "border p-7 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg transition"
                : "border p-7 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md transition"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-white/10 border-white/20 text-[#98D8D0] transition"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center bg-[#98D8D0]/30 border-white text-[#1D8B94] transition"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              احراز هویت JWT امن
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              محافظت دو سطحی از اطلاعات فریلنسرها و حفظ حریم خصوصی مراجعان با توکن‌های رمزنگاری‌شده.
            </p>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer
        className={
          isDark
            ? "border-t border-white/10 bg-[#04222B]/80 py-6 px-6 relative z-10"
            : "border-t border-[#98D8D0]/40 bg-white/75 py-6 px-6 relative z-10"
        }
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className={isDark ? "text-[#98D8D0]/80" : "text-[#0A3D4A]/80"}>
            © ۱۴۰۵ سولوپورتال (SoloPortal) - پلتفرم جامع و هوشمند مدیریت جلسات
          </span>
          <div className="flex items-center gap-6">
            <a href="/login?mode=login" className={isDark ? "text-[#98D8D0] hover:text-white transition" : "text-[#1D8B94] hover:text-[#04222B] transition"}>
              ورود اعضا
            </a>
            <a href="/login?mode=register" className={isDark ? "text-[#98D8D0] hover:text-white transition" : "text-[#1D8B94] hover:text-[#04222B] transition"}>
              ثبت‌نام
            </a>
            <a href="/book/shaghayegh" className={isDark ? "text-[#98D8D0] hover:text-white transition" : "text-[#1D8B94] hover:text-[#04222B] transition"}>
              پورتال عمومی
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
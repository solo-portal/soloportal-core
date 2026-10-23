"use client";

import { useState, useRef, useEffect } from "react";

export default function HomePage() {
  // خواندن مستقیم تم از لوکال‌استوریج از همان لحظه اول برای جلوگیری از چشمک زدن
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("soloportal_theme");
      if (savedTheme !== null) {
        return savedTheme === "dark";
      }
    }
    return true; // پیش‌فرض
  });

  const [selectedTime, setSelectedTime] = useState("۰۹:۰۰");
  const [showMoreTimes, setShowMoreTimes] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState("۴۵");
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("18:30");
  const [customTimesList, setCustomTimesList] = useState<string[]>([]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const initialTimes = ["۰۹:۰۰", "۱۰:۰۰", "۱۱:۰۰"];
  const extraTimes = ["۱۴:۰۰", "۱۶:۰۰", "۱۷:۳۰"];
  const presetDurations = ["۱۵", "۳۰", "۴۵", "۶۰", "۹۰"];

  const baseTimes = showMoreTimes ? [...initialTimes, ...extraTimes] : initialTimes;
  const displayedTimes = [...baseTimes, ...customTimesList];

  const toPersianDigits = (str: string) =>
    str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleAddCustomTime = () => {
    if (!customTimeInput) return;
    const formattedTime = toPersianDigits(customTimeInput);
    if (!displayedTimes.includes(formattedTime)) {
      setCustomTimesList([...customTimesList, formattedTime]);
    }
    setSelectedTime(formattedTime);
  };

  return (
    <div
      className={
        isDark
          ? "min-h-screen bg-gradient-to-br from-[#04222B] via-[#0A3D4A] to-[#10606F] text-[#E2F4F0] font-sans relative overflow-x-hidden"
          : "min-h-screen bg-gradient-to-br from-[#E2F4F0] via-[#F2F8F6] to-[#98D8D0]/30 text-[#04222B] font-sans relative overflow-x-hidden"
      }
    >
      <div
        className={
          isDark
            ? "absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#1D8B94]/25"
            : "absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#98D8D0]/35"
        }
      ></div>
      <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#4FB8B4]/15"></div>

      <header
        className={
          isDark
            ? "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/10 bg-[#04222B]/60 shadow-lg"
            : "w-full border-b backdrop-blur-md sticky top-0 z-50 border-white/60 bg-white/75 shadow-sm"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={
                isDark
                  ? "w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-lg bg-white/10 border-white/20 text-[#E2F4F0]"
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
          </div><nav
            className={
              isDark
                ? "hidden md:flex items-center gap-7 text-sm font-medium text-[#98D8D0]/90 whitespace-nowrap"
                : "hidden md:flex items-center gap-7 text-sm font-medium text-[#0A3D4A]/90 whitespace-nowrap"
            }
          >
            <a href="#" className="hover:opacity-75 whitespace-nowrap">صفحه اصلی</a>
            <a href="#" className="hover:opacity-75 whitespace-nowrap">ویژگی‌ها</a>
            <a href="#" className="hover:opacity-75 whitespace-nowrap">قیمت‌گذاری</a>
            <a href="#" className="hover:opacity-75 whitespace-nowrap">درباره ما</a>
            <a href="#" className="hover:opacity-75 whitespace-nowrap">تماس با ما</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/dashboard"
              className={
                isDark
                  ? "text-sm font-medium px-4 py-2 text-[#E2F4F0]/90 hover:text-white whitespace-nowrap"
                  : "text-sm font-medium px-4 py-2 text-[#0A3D4A] hover:text-black whitespace-nowrap"
              }
            >
              ورود
            </a>
            <a
              href="/dashboard"
              className="text-sm font-bold px-5 py-2.5 rounded-2xl bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-md whitespace-nowrap"
            >
              ثبت‌نام
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-3 flex justify-end relative z-40">
        <button
          onClick={toggleTheme}
          title={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
          className={
            isDark
              ? "px-3.5 py-2 rounded-2xl border cursor-pointer flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/20 border-white/20 text-[#98D8D0] shadow-md"
              : "px-3.5 py-2 rounded-2xl border cursor-pointer flex items-center gap-2 text-xs font-medium bg-white/80 hover:bg-white border-[#1D8B94]/25 text-[#0A3D4A] shadow-sm"
          }
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>حالت روشن</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-[#1D8B94]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              <span>حالت تیره</span>
            </>
          )}
        </button>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-6 text-right">
          <div
            className={
              isDark
                ? "inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-semibold bg-white/10 border-white/20 text-[#E2F4F0]"
                : "inline-flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-semibold bg-white/80 border-white text-[#1D8B94] shadow-sm"
            }
          >
            <span className="w-2 h-2 rounded-full animate-pulse bg-[#4FB8B4]"></span>
            سامانه جامع رزرواسیون و مدیریت جلسات
          </div>

          <h1
            className={
              isDark
                ? "text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white": "text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-[#04222B]"
            }
          >
            به سادگی نوبت رزرو کنید، <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D8B94] to-[#4FB8B4]">
              زمان شما ارزشمند است!
            </span>
          </h1>

          <p
            className={
              isDark
                ? "text-base sm:text-lg leading-relaxed max-w-xl text-[#E2F4F0]/80"
                : "text-base sm:text-lg leading-relaxed max-w-xl text-[#0A3D4A]/90"
            }
          >
            با سولوپورتال، به راحتی نوبت‌های خود را رزرو کنید. مناسب برای مشاوران، پزشکان، کارشناسان و تمام کسانی که زمان دیگران برایشان مهم است.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="/dashboard"
              className="font-bold px-8 py-4 rounded-2xl flex items-center gap-2 bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-lg"
            >
              شروع کنید
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="#"
              className={
                isDark
                  ? "font-medium px-8 py-4 rounded-2xl border bg-white/5 hover:bg-white/10 text-[#E2F4F0] border-white/10"
                  : "font-medium px-8 py-4 rounded-2xl border bg-white/70 hover:bg-white text-[#04222B] border-white shadow-sm"
              }
            >
              مشاهده دمو
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div
            className={
              isDark
                ? "border p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl"
                : "border p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-white/80 border-white shadow-xl"
            }
          >
            <div
              className={
                isDark
                  ? "rounded-2xl p-6 border shadow-inner space-y-5 bg-[#04222B]/50 border-white/10"
                  : "rounded-2xl p-6 border shadow-inner space-y-5 bg-[#E2F4F0]/60 border-white"
              }
            >
              <div
                className={
                  isDark
                    ? "flex items-center justify-between border-b pb-4 border-white/10"
                    : "flex items-center justify-between border-b pb-4 border-[#98D8D0]/40"
                }
              >
                <div className="flex items-center gap-3">
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
                    title="کلیک برای انتخاب یا تغییر عکس پروفایل"
                    className="w-12 h-12 rounded-2xl border bg-[#1D8B94]/40 border-white/40 flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm shrink-0"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="پروفایل" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">ش</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                  </button>

                  <div>
                    <h3 className={isDark ? "font-bold text-sm text-white" : "font-bold text-sm text-[#04222B]"}>
                      شقایق خوبکار
                    </h3>
                    <p className={isDark ? "text-xs text-[#98D8D0]" : "text-xs text-[#1D8B94]"}>
                      مشاور و برنامه‌ریز تحصیلی
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
                  title="کلیک برای تغییر مدت زمان جلسه"
                  className={
                    isDark
                      ? "text-xs px-3 py-1.5 rounded-xl font-medium border bg-white/15 hover:bg-white/25 text-white border-white/20 cursor-pointer flex items-center gap-1.5 transition"
                      : "text-xs px-3 py-1.5 rounded-xl font-medium border bg-[#1D8B94]/10 hover:bg-[#1D8B94]/20 text-[#1D8B94] border-[#1D8B94]/20 cursor-pointer flex items-center gap-1.5 transition"
                  }
                >
                  <span>{duration} دقیقه</span>
                  <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={isDark ? "text-xs font-semibold text-[#E2F4F0]/90" : "text-xs font-semibold text-[#0A3D4A]"}>
                  انتخاب زمان آزاد:
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
                        ? "text-xs px-2.5 py-1 rounded-lg bg-[#1D8B94]/40 hover:bg-[#1D8B94]/70 text-white border border-white/20 cursor-pointer transition"
                        : "text-xs px-2.5 py-1 rounded-lg bg-[#1D8B94]/15 hover:bg-[#1D8B94]/25 text-[#04222B] border border-[#1D8B94]/30 cursor-pointer transition"
                    }
                  >
                    {showCustomSettings ? "بستن تنظیم دستی" : "⚙️ زمان و مدت دلخواه"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {displayedTimes.map((time) => {const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={
                        isSelected
                          ? "text-white text-center py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] border border-[#4FB8B4] shadow-md cursor-pointer scale-[1.02]"
                          : isDark
                          ? "border text-center py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/15 text-[#98D8D0] border-white/10 cursor-pointer"
                          : "border text-center py-2.5 rounded-xl text-xs font-medium bg-white/80 hover:bg-white text-[#1D8B94] border-[#98D8D0]/40 cursor-pointer"
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
                      ? "p-4 rounded-xl border bg-white/5 border-white/15 space-y-4 text-xs"
                      : "p-4 rounded-xl border bg-white/90 border-[#98D8D0]/50 space-y-4 text-xs shadow-sm"
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
                            ? "w-24 px-2.5 py-1.5 rounded-lg border bg-[#04222B]/80 border-white/20 text-white placeholder:text-white/40 focus:outline-none"
                            : "w-24 px-2.5 py-1.5 rounded-lg border bg-white border-[#98D8D0] text-[#04222B] placeholder:text-[#04222B]/40 focus:outline-none"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="font-semibold block">تعیین ساعت دلخواه جلسه:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={customTimeInput}
                        onChange={(e) => setCustomTimeInput(e.target.value)}
                        className={
                          isDark
                            ? "px-3 py-1.5 rounded-lg border bg-[#04222B]/80 border-white/20 text-white focus:outline-none cursor-pointer": "px-3 py-1.5 rounded-lg border bg-white border-[#98D8D0] text-[#04222B] focus:outline-none cursor-pointer"
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
                    ? "pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#98D8D0] border-t border-white/10"
                    : "pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#0A3D4A] border-t border-[#98D8D0]/40"
                }
              >
                <span>
                  رزرو شما:{" "}
                  <strong className={isDark ? "text-white" : "text-[#04222B]"}>
                    ساعت {selectedTime}
                  </strong>{" "}
                  ({duration} دقیقه)
                </span>
                <span className="text-[11px] opacity-75">(برای تغییر عکس روی آواتار کلیک کنید)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
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
                ? "text-3xl font-extrabold tracking-tight text-white"
                : "text-3xl font-extrabold tracking-tight text-[#04222B]"
            }
          >
            چرا سولوپورتال؟
          </h2>
          <p
            className={
              isDark
                ? "text-sm sm:text-base text-[#E2F4F0]/80"
                : "text-sm sm:text-base text-[#0A3D4A]/80"
            }
          >
            ما به شما کمک می‌کنیم تا زمان خود را بهتر مدیریت کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={
              isDark
                ? "border p-8 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg"
                : "border p-8 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-white/10 border-white/20 text-[#98D8D0]"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-[#98D8D0]/30 border-white text-[#1D8B94]"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              امنیت بالا
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود.
            </p>
          </div><div
            className={
              isDark
                ? "border p-8 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg"
                : "border p-8 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-white/10 border-white/20 text-[#98D8D0]"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-[#98D8D0]/30 border-white text-[#1D8B94]"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              تقویم شمسی
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              پشتیبانی کامل از تقویم شمسی و تعطیلات رسمی ایران.
            </p>
          </div>

          <div
            className={
              isDark
                ? "border p-8 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg"
                : "border p-8 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-white/10 border-white/20 text-[#98D8D0]"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-[#98D8D0]/30 border-white text-[#1D8B94]"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              رزرو سریع
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              در چند ثانیه نوبت خود را رزرو کنید.
            </p>
          </div>

          <div
            className={
              isDark
                ? "border p-8 rounded-3xl text-right space-y-4 group bg-[#0A3D4A]/60 hover:bg-[#0A3D4A]/90 border-white/15 shadow-lg"
                : "border p-8 rounded-3xl text-right space-y-4 group bg-white/90 hover:bg-white border-white shadow-md"
            }
          >
            <div
              className={
                isDark
                  ? "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-white/10 border-white/20 text-[#98D8D0]"
                  : "w-12 h-12 rounded-2xl border group-hover:bg-[#1D8B94] group-hover:text-white flex items-center justify-center font-bold bg-[#98D8D0]/30 border-white text-[#1D8B94]"
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
              دسترسی در همه‌جا
            </h3>
            <p className={isDark ? "text-xs sm:text-sm leading-relaxed text-[#E2F4F0]/75" : "text-xs sm:text-sm leading-relaxed text-[#0A3D4A]/80"}>
              مناسب برای موبایل، تبلت و دسکتاپ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
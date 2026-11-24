"use client";

import { useState, useLayoutEffect } from "react";

type DashboardTab = "overview" | "bookings" | "services" | "schedule";

interface BookingItem {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceTitle: string;
  dateTime: string;
  price: string;
  status: "confirmed" | "cancelled";
  notes: string;
}

interface DashboardService {
  id: string;
  title: string;
  duration: string;
  description: string;
  price: string;
}

interface DaySchedule {
  id: string;
  dayName: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "SP-101",
    clientName: "سارا جلالی",
    clientEmail: "sara.jalali@example.com",
    clientPhone: "09123456789",
    serviceTitle: "مشاوره استراتژی کسب‌وکار",
    dateTime: "شنبه ۸ آذر - ۱۰:۳۰",
    price: "۸۵۰,۰۰۰ تومان",
    status: "confirmed",
    notes: "بررسی مدل درآمدی استارتاپ و تعیین اهداف سه ماهه اول",
  },
  {
    id: "SP-102",
    clientName: "مهدی رضایی",
    clientEmail: "mahdi.rezaei@example.com",
    clientPhone: "09351112233",
    serviceTitle: "برنامه‌ریزی و تدوین رودمپ",
    dateTime: "یکشنبه ۹ آذر - ۱۵:۰۰",
    price: "۱,۲۰۰,۰۰۰ تومان",
    status: "confirmed",
    notes: "اولویت‌بندی تسک‌های فنی و مارکتینگ",
  },
  {
    id: "SP-103",
    clientName: "علی کاظمی",
    clientEmail: "ali.kazemi@example.com",
    clientPhone: "09198887766",
    serviceTitle: "جلسه پیگیری و رفع اشکال",
    dateTime: "دوشنبه ۱۰ آذر - ۱۲:۰۰",
    price: "۴۵۰,۰۰۰ تومان",
    status: "cancelled",
    notes: "کنسل شده توسط مراجع به دلیل تداخل کاری",
  },
  {
    id: "SP-104",
    clientName: "نگین فرهادی",
    clientEmail: "negin.f@example.com",
    clientPhone: "09129994455",
    serviceTitle: "مشاوره استراتژی کسب‌وکار",
    dateTime: "سه‌شنبه ۱۱ آذر - ۱۶:۳۰",
    price: "۸۵۰,۰۰۰ تومان",
    status: "confirmed",
    notes: "مشاوره راه‌اندازی کمپین فروش",
  },
];

const INITIAL_SERVICES: DashboardService[] = [
  {
    id: "srv-1",
    title: "مشاوره استراتژی کسب‌وکار",
    duration: "۶۰ دقیقه",
    description: "بررسی مدل درآمدی، تحلیل بازار و تدوین نقشه راه اجرایی",
    price: "۸۵۰,۰۰۰ تومان",
  },
  {
    id: "srv-2",
    title: "برنامه‌ریزی و تدوین رودمپ",
    duration: "۹۰ دقیقه",
    description: "جلسه تخصصی عمیق برای اولویت‌بندی اهداف فصلی و عملیاتی",
    price: "۱,۲۰۰,۰۰۰ تومان",
  },
  {
    id: "srv-3",
    title: "جلسه پیگیری و رفع اشکال",
    duration: "۳۰ دقیقه",
    description: "بررسی سریع وضعیت پیشرفت کارها و پاسخ به سوالات کلیدی",
    price: "۴۵۰,۰۰۰ تومان",
  },
];

const INITIAL_SCHEDULE: DaySchedule[] = [
  { id: "sat", dayName: "شنبه", active: true, startTime: "09:00", endTime: "17:00" },
  { id: "sun", dayName: "یکشنبه", active: true, startTime: "09:00", endTime: "17:00" },
  { id: "mon", dayName: "دوشنبه", active: true, startTime: "10:00", endTime: "18:00" },
  { id: "tue", dayName: "سه‌شنبه", active: true, startTime: "09:00", endTime: "16:00" },
  { id: "wed", dayName: "چهارشنبه", active: true, startTime: "09:00", endTime: "15:00" },
  { id: "thu", dayName: "پنج‌شنبه", active: false, startTime: "10:00", endTime: "14:00" },
  { id: "fri", dayName: "جمعه (تعطیل)", active: false, startTime: "10:00", endTime: "14:00" },
];

export default function FreelancerDashboardPage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [userName, setUserName] = useState<string>("شقایق خوبکار");
  const [userSlug, setUserSlug] = useState<string>("shaghayegh");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // وضعیت‌های مدیریت رزروها
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [bookingFilter, setBookingFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // وضعیت‌های مدیریت خدمات
  const [services, setServices] = useState<DashboardService[]>(INITIAL_SERVICES);
  const [showAddServiceForm, setShowAddServiceForm] = useState<boolean>(false);
  const [newServiceTitle, setNewServiceTitle] = useState<string>("");
  const [newServiceDuration, setNewServiceDuration] = useState<string>("۴۵ دقیقه");
  const [newServicePrice, setNewServicePrice] = useState<string>("");
  const [newServiceDesc, setNewServiceDesc] = useState<string>("");

  // وضعیت‌های تقویم کاری
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [scheduleSaved, setScheduleSaved] = useState<boolean>(false);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }

    const savedUser = localStorage.getItem("soloportal_demo_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.fullName) setUserName(parsed.fullName);
        if (parsed.slug) setUserSlug(parsed.slug);
      } catch {
        // نادیده گرفتن خطای احتمالی JSON
      }
    }

    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const handleCopyPortalLink = () => {
    const link = `https://soloportal.ir/${userSlug}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleBookingStatus = (id: string) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "confirmed" ? "cancelled" : "confirmed",
            }
          : item
      )
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({
        ...selectedBooking,
        status: selectedBooking.status === "confirmed" ? "cancelled" : "confirmed",
      });
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim() || !newServicePrice.trim()) return;

    const created: DashboardService = {
      id: `srv-${Date.now()}`,
      title: newServiceTitle.trim(),
      duration: newServiceDuration,
      description: newServiceDesc.trim() || "جلسه مشاوره تخصصی آنلاین",
      price: newServicePrice.includes("تومان")
        ? newServicePrice.trim()
        : `${newServicePrice.trim()} تومان`,
    };

    setServices([created, ...services]);
    setNewServiceTitle("");
    setNewServicePrice("");
    setNewServiceDesc("");
    setShowAddServiceForm(false);
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleScheduleChange = (
    id: string,
    field: "active" | "startTime" | "endTime",
    value: boolean | string
  ) => {
    setScheduleSaved(false);
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  if (!isMounted) {
    return <div className="min-h-screen bg-[#04222B]" />;
  }

  return (
    <div
      dir="rtl"
      className={
        isDark
          ? "min-h-screen bg-gradient-to-br from-[#04222B] via-[#0A3D4A] to-[#10606F] text-[#E2F4F0] font-sans relative overflow-x-hidden flex flex-col"
          : "min-h-screen bg-gradient-to-br from-[#E2F4F0] via-[#F2F8F6] to-[#98D8D0]/30 text-[#04222B] font-sans relative overflow-x-hidden flex flex-col"
      }
    >
      {/* هدر بالا */}
      <header
        className={
          isDark
            ? "w-full border-b backdrop-blur-md sticky top-0 z-40 border-white/10 bg-[#04222B]/80"
            : "w-full border-b backdrop-blur-md sticky top-0 z-40 border-white/60 bg-white/85"
        }
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div
                className={
                  isDark
                    ? "w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-base bg-white/10 border-white/20 text-[#98D8D0]"
                    : "w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-base bg-[#1D8B94]/10 border-[#1D8B94]/20 text-[#1D8B94]"
                }
              >
                س
              </div>
              <span
                className={
                  isDark
                    ? "text-lg font-bold tracking-tight text-white"
                    : "text-lg font-bold tracking-tight text-[#04222B]"
                }
              >
                سولو<span className={isDark ? "text-[#98D8D0]" : "text-[#1D8B94]"}>پورتال</span>
              </span>
            </a>
            <span
              className={
                isDark
                  ? "hidden sm:inline-block text-xs px-2.5 py-1 rounded-lg bg-white/10 text-[#98D8D0]"
                  : "hidden sm:inline-block text-xs px-2.5 py-1 rounded-lg bg-[#1D8B94]/10 text-[#1D8B94] font-medium"
              }
            >
              پنل مدیریت فریلنسر
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyPortalLink}
              className={
                isDark
                  ? "text-xs px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-[#98D8D0] cursor-pointer transition"
                  : "text-xs px-3.5 py-2 rounded-xl border border-[#1D8B94]/25 bg-white hover:bg-[#E2F4F0] text-[#1D8B94] font-medium cursor-pointer transition"
              }
            >
              {copiedLink ? "✓ لینک پورتال کپی شد" : "🔗 کپی لینک پورتال"}
            </button>

            <a
              href="/book"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-sm transition"
            >
              مشاهده صفحه رزرو
            </a>

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

            <a
              href="/login"
              className={
                isDark
                  ? "text-xs px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 transition"
                  : "text-xs px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 transition"
              }
            >
              خروج
            </a>
          </div>
        </div>
      </header>

      {/* بدنه اصلی داشبورد: سایدبار راست + محتوای اصلی چپ */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 relative z-10">
        {/* سایدبار راست مطابق عکس‌های فیگما */}
        <aside className="lg:col-span-3 space-y-4">
          <div
            className={
              isDark
                ? "p-5 rounded-3xl border backdrop-blur-xl bg-[#04222B]/75 border-white/15 space-y-5 shadow-xl"
                : "p-5 rounded-3xl border backdrop-blur-xl bg-white/90 border-white space-y-5 shadow-md"
            }
          >
            {/* پروفایل فریلنسر در بالای سایدبار */}
            <div
              className={
                isDark
                  ? "flex items-center gap-3 pb-4 border-b border-white/10"
                  : "flex items-center gap-3 pb-4 border-b border-[#98D8D0]/40"
              }
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1D8B94] text-white font-bold flex items-center justify-center shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="text-right overflow-hidden">
                <div className={isDark ? "font-bold text-sm text-white truncate" : "font-bold text-sm text-[#04222B] truncate"}>
                  {userName}
                </div>
                <div dir="ltr" className={isDark ? "text-[11px] text-[#98D8D0] truncate text-right" : "text-[11px] text-[#1D8B94] truncate text-right"}>
                  soloportal.ir/{userSlug}
                </div>
              </div>
            </div>

            {/* دکمه‌های منوی سایدبار */}
            <nav className="space-y-1.5 text-right">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={
                  activeTab === "overview"
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] text-white shadow cursor-pointer flex items-center gap-2.5 transition"
                    : isDark
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#E2F4F0]/80 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition"
                    : "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#0A3D4A] hover:bg-[#E2F4F0] cursor-pointer flex items-center gap-2.5 transition"
                }
              >
                <span>📊</span>
                <span>نمای کلی و آمار عملکرد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bookings")}
                className={
                  activeTab === "bookings"
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] text-white shadow cursor-pointer flex items-center justify-between transition"
                    : isDark
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#E2F4F0]/80 hover:bg-white/10 cursor-pointer flex items-center justify-between transition"
                    : "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#0A3D4A] hover:bg-[#E2F4F0] cursor-pointer flex items-center justify-between transition"
                }
              >
                <span className="flex items-center gap-2.5">
                  <span>📅</span>
                  <span>مدیریت رزروها</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20">
                  {bookings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={
                  activeTab === "services"
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] text-white shadow cursor-pointer flex items-center gap-2.5 transition"
                    : isDark
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#E2F4F0]/80 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition"
                    : "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#0A3D4A] hover:bg-[#E2F4F0] cursor-pointer flex items-center gap-2.5 transition"
                }
              >
                <span>💼</span>
                <span>خدمات و تعرفه‌ها</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={
                  activeTab === "schedule"
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] text-white shadow cursor-pointer flex items-center gap-2.5 transition"
                    : isDark
                    ? "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#E2F4F0]/80 hover:bg-white/10 cursor-pointer flex items-center gap-2.5 transition"
                    : "w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-[#0A3D4A] hover:bg-[#E2F4F0] cursor-pointer flex items-center gap-2.5 transition"
                }
              >
                <span>⏰</span>
                <span>تقویم و ساعات کاری</span>
              </button>
            </nav>

            {/* باکس وضعیت پورتال در پایین سایدبار */}
            <div
              className={
                isDark
                  ? "p-4 rounded-2xl bg-white/5 border border-white/10 text-right space-y-2.5"
                  : "p-4 rounded-2xl bg-[#E2F4F0]/70 border border-[#98D8D0]/40 text-right space-y-2.5"
              }
            >
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-75">وضعیت صفحه عمومی:</span>
                <span className="text-emerald-400 font-bold">● فعال</span>
              </div>
              <a
                href="/book"
                className="block text-center w-full py-2 rounded-xl text-xs font-bold bg-[#1D8B94]/20 hover:bg-[#1D8B94] text-[#98D8D0] hover:text-white border border-[#4FB8B4]/30 transition"
              >
                مشاهده صفحه رزرو من
              </a>
            </div>
          </div>
        </aside>

        {/* محتوای اصلی سمت چپ بر اساس تب انتخاب‌شده */}
        <main className="lg:col-span-9 space-y-6">
          {/* تب ۱: نمای کلی و آمار عملکرد */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="text-right">
                <h1 className={isDark ? "text-xl sm:text-2xl font-extrabold text-white" : "text-xl sm:text-2xl font-extrabold text-[#04222B]"}>
                  نمای کلی و آمار عملکرد
                </h1>
                <p className={isDark ? "text-xs text-[#98D8D0]/80 mt-1" : "text-xs text-[#0A3D4A]/80 mt-1"}>
                  خلاصه وضعیت جلسات، درآمد و مراجعان این ماه شما
                </p>
              </div>

              {/* ۴ کارت آمار بالا مطابق عکس هفتم فیگما */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={
                    isDark
                      ? "p-5 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right space-y-2 shadow-lg"
                      : "p-5 rounded-3xl border bg-white/90 border-white text-right space-y-2 shadow-md"
                  }
                >
                  <span className="text-xs opacity-75">مجموع رزروها</span>
                  <div className={isDark ? "text-2xl font-extrabold text-white" : "text-2xl font-extrabold text-[#04222B]"}>
                    ۴۸ جلسه
                  </div>
                  <span className="text-[11px] text-emerald-400 block">+۱۲٪ نسبت به ماه قبل</span>
                </div>

                <div
                  className={
                    isDark
                      ? "p-5 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right space-y-2 shadow-lg"
                      : "p-5 rounded-3xl border bg-white/90 border-white text-right space-y-2 shadow-md"
                  }
                >
                  <span className="text-xs opacity-75">جلسات پیش‌رو</span>
                  <div className={isDark ? "text-2xl font-extrabold text-[#98D8D0]" : "text-2xl font-extrabold text-[#1D8B94]"}>
                    {confirmedCount} جلسه
                  </div>
                  <span className="text-[11px] opacity-70 block">برنامه‌ریزی شده برای این هفته</span>
                </div>

                <div
                  className={
                    isDark
                      ? "p-5 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right space-y-2 shadow-lg"
                      : "p-5 rounded-3xl border bg-white/90 border-white text-right space-y-2 shadow-md"
                  }
                >
                  <span className="text-xs opacity-75">درآمد ماه جاری</span>
                  <div className={isDark ? "text-2xl font-extrabold text-white" : "text-2xl font-extrabold text-[#04222B]"}>
                    ۱۸.۴ م
                  </div>
                  <span className="text-[11px] text-emerald-400 block">تومان (تسویه شده)</span>
                </div>

                <div
                  className={
                    isDark
                      ? "p-5 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right space-y-2 shadow-lg"
                      : "p-5 rounded-3xl border bg-white/90 border-white text-right space-y-2 shadow-md"
                  }
                >
                  <span className="text-xs opacity-75">مشتریان فعال</span>
                  <div className={isDark ? "text-2xl font-extrabold text-white" : "text-2xl font-extrabold text-[#04222B]"}>
                    ۳۱ نفر
                  </div>
                  <span className="text-[11px] opacity-70 block">رضایت ۴.۹ از ۵</span>
                </div>
              </div>

              {/* جدول نزدیک‌ترین جلسات رزرو شده */}
              <div
                className={
                  isDark
                    ? "p-6 rounded-3xl border bg-[#04222B]/75 border-white/15 space-y-4 shadow-xl"
                    : "p-6 rounded-3xl border bg-white/90 border-white space-y-4 shadow-md"
                }
              >
                <div className="flex items-center justify-between">
                  <h2 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
                    نزدیک‌ترین جلسات رزرو شده
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("bookings")}
                    className={
                      isDark
                        ? "text-xs text-[#98D8D0] hover:text-white cursor-pointer underline underline-offset-4"
                        : "text-xs text-[#1D8B94] hover:text-[#04222B] cursor-pointer underline underline-offset-4"
                    }
                  >
                    مشاهده همه رزروها ←
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className={isDark ? "border-b border-white/10 text-[#98D8D0]/80" : "border-b border-[#98D8D0]/40 text-[#0A3D4A]/80"}>
                        <th className="py-3 px-2 font-semibold">مراجع</th>
                        <th className="py-3 px-2 font-semibold">خدمت انتخابی</th>
                        <th className="py-3 px-2 font-semibold">تاریخ و زمان</th>
                        <th className="py-3 px-2 font-semibold">مبلغ</th>
                        <th className="py-3 px-2 font-semibold">وضعیت</th>
                        <th className="py-3 px-2 font-semibold">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.slice(0, 3).map((b) => (
                        <tr key={b.id} className={isDark ? "hover:bg-white/5" : "hover:bg-[#E2F4F0]/50"}>
                          <td className="py-3.5 px-2 font-bold">{b.clientName}</td>
                          <td className="py-3.5 px-2">{b.serviceTitle}</td>
                          <td className="py-3.5 px-2">{b.dateTime}</td>
                          <td className="py-3.5 px-2">{b.price}</td>
                          <td className="py-3.5 px-2">
                            {b.status === "confirmed" ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400">
                                تایید شده
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400">
                                لغو شده
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-xl text-xs bg-[#1D8B94]/25 hover:bg-[#1D8B94] text-[#98D8D0] hover:text-white cursor-pointer transition"
                            >
                              جزئیات
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* تب ۲: مدیریت و پایش رزروها مطابق عکس هشتم فیگما */}
          {activeTab === "bookings" && (
            <div
              className={
                isDark
                  ? "p-6 rounded-3xl border bg-[#04222B]/75 border-white/15 space-y-5 shadow-xl"
                  : "p-6 rounded-3xl border bg-white/90 border-white space-y-5 shadow-md"
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-right">
                  <h1 className={isDark ? "text-xl font-extrabold text-white" : "text-xl font-extrabold text-[#04222B]"}>
                    مدیریت و پایش رزروها
                  </h1>
                  <p className="text-xs opacity-75 mt-1">
                    مشاهده جزئیات مراجعان و تغییر وضعیت نوبت‌ها
                  </p>
                </div>

                {/* فیلتر تب‌های وضعیت */}
                <div
                  className={
                    isDark
                      ? "flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs"
                      : "flex items-center gap-1.5 p-1 rounded-2xl bg-[#E2F4F0] border border-[#98D8D0]/40 text-xs"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setBookingFilter("all")}
                    className={
                      bookingFilter === "all"
                        ? "px-3.5 py-1.5 rounded-xl font-bold bg-[#1D8B94] text-white cursor-pointer"
                        : "px-3.5 py-1.5 rounded-xl opacity-75 hover:opacity-100 cursor-pointer"
                    }
                  >
                    همه ({bookings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFilter("confirmed")}
                    className={
                      bookingFilter === "confirmed"
                        ? "px-3.5 py-1.5 rounded-xl font-bold bg-[#1D8B94] text-white cursor-pointer"
                        : "px-3.5 py-1.5 rounded-xl opacity-75 hover:opacity-100 cursor-pointer"
                    }
                  >
                    تایید شده ({confirmedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFilter("cancelled")}
                    className={
                      bookingFilter === "cancelled"
                        ? "px-3.5 py-1.5 rounded-xl font-bold bg-[#1D8B94] text-white cursor-pointer"
                        : "px-3.5 py-1.5 rounded-xl opacity-75 hover:opacity-100 cursor-pointer"
                    }
                  >
                    لغو شده ({bookings.length - confirmedCount})
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className={isDark ? "border-b border-white/10 text-[#98D8D0]/80" : "border-b border-[#98D8D0]/40 text-[#0A3D4A]/80"}>
                      <th className="py-3 px-2 font-semibold">شناسه</th>
                      <th className="py-3 px-2 font-semibold">مراجع</th>
                      <th className="py-3 px-2 font-semibold">خدمت</th>
                      <th className="py-3 px-2 font-semibold">تاریخ و زمان</th>
                      <th className="py-3 px-2 font-semibold">وضعیت</th>
                      <th className="py-3 px-2 font-semibold">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className={isDark ? "hover:bg-white/5" : "hover:bg-[#E2F4F0]/50"}>
                        <td className="py-3.5 px-2 font-mono text-xs opacity-80">{b.id}</td>
                        <td className="py-3.5 px-2 font-bold">{b.clientName}</td>
                        <td className="py-3.5 px-2">{b.serviceTitle}</td>
                        <td className="py-3.5 px-2">{b.dateTime}</td>
                        <td className="py-3.5 px-2">
                          {b.status === "confirmed" ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400">
                              تایید شده
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400">
                              لغو شده
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1.5 rounded-xl text-xs bg-[#1D8B94]/25 hover:bg-[#1D8B94] text-[#98D8D0] hover:text-white cursor-pointer transition"
                          >
                            جزئیات
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBookingStatus(b.id)}
                            className={
                              b.status === "confirmed"
                                ? "px-3 py-1.5 rounded-xl text-xs bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white cursor-pointer transition"
                                : "px-3 py-1.5 rounded-xl text-xs bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-white cursor-pointer transition"
                            }
                          >
                            {b.status === "confirmed" ? "لغو نوبت" : "تایید مجدد"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تب ۳: تعریف و مدیریت خدمات مطابق عکس نهم فیگما */}
          {activeTab === "services" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-right">
                    <h1 className={isDark ? "text-xl font-extrabold text-white" : "text-xl font-extrabold text-[#04222B]"}>
                    تعریف و مدیریت خدمات
                  </h1>
                  <p className="text-xs opacity-75 mt-1">
                    مراجعان در صفحه رزرو عمومی می‌توانند این خدمات را انتخاب کنند
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-md cursor-pointer transition"
                >
                  {showAddServiceForm ? "بستن فرم" : "+ افزودن خدمت جدید"}
                </button>
              </div>

              {/* فرم افزودن خدمت جدید */}
              {showAddServiceForm && (
                <form
                  onSubmit={handleAddService}
                  className={
                    isDark
                      ? "p-6 rounded-3xl border bg-[#04222B]/85 border-[#4FB8B4]/40 space-y-4 text-right shadow-xl"
                      : "p-6 rounded-3xl border bg-white border-[#1D8B94]/40 space-y-4 text-right shadow-md"
                  }
                >
                  <h3 className="font-bold text-sm">اطلاعات خدمت جدید:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">عنوان خدمت *</label>
                      <input
                        type="text"
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        placeholder="مثلاً: مشاوره رزومه و مصاحبه"
                        className={
                          isDark
                            ? "w-full px-3.5 py-2.5 rounded-xl border bg-white/5 border-white/15 text-xs text-white focus:outline-none"
                            : "w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F8F6] border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">مدت زمان</label>
                      <select
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className={
                          isDark
                            ? "w-full px-3.5 py-2.5 rounded-xl border bg-[#0A3D4A] border-white/15 text-xs text-white focus:outline-none"
                            : "w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F8F6] border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                        }
                      >
                        <option value="۱۵ دقیقه">۱۵ دقیقه</option>
                        <option value="۳۰ دقیقه">۳۰ دقیقه</option>
                        <option value="۴۵ دقیقه">۴۵ دقیقه</option>
                        <option value="۶۰ دقیقه">۶۰ دقیقه</option>
                        <option value="۹۰ دقیقه">۹۰ دقیقه</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">تعرفه (تومان) *</label>
                      <input
                        type="text"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="مثلاً: ۶۰۰,۰۰۰"
                        className={
                          isDark
                            ? "w-full px-3.5 py-2.5 rounded-xl border bg-white/5 border-white/15 text-xs text-white focus:outline-none"
                            : "w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F8F6] border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">توضیحات کوتاه</label>
                    <input
                      type="text"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="توضیح مختصر درباره محتوای این جلسه..."
                      className={
                        isDark
                          ? "w-full px-3.5 py-2.5 rounded-xl border bg-white/5 border-white/15 text-xs text-white focus:outline-none"
                          : "w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F8F6] border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white cursor-pointer transition"
                    >
                      ذخیره خدمت جدید ✓
                    </button>
                  </div>
                </form>
              )}

              {/* گرید ۳ ستونه خدمات تعریف‌شده مطابق عکس نهم فیگما */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className={
                      isDark
                        ? "p-6 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right flex flex-col justify-between gap-5 shadow-lg"
                        : "p-6 rounded-3xl border bg-white/90 border-white text-right flex flex-col justify-between gap-5 shadow-md"
                    }
                  >
                    <div className="space-y-2.5">
                      <span
                        className={
                          isDark
                            ? "inline-block text-[11px] px-2.5 py-1 rounded-lg bg-[#1D8B94]/25 text-[#98D8D0]"
                            : "inline-block text-[11px] px-2.5 py-1 rounded-lg bg-[#1D8B94]/10 text-[#1D8B94] font-medium"
                        }
                      >
                        {srv.duration}
                      </span>
                      <h3 className={isDark ? "font-bold text-base text-white" : "font-bold text-base text-[#04222B]"}>
                        {srv.title}
                      </h3>
                      <p className="text-xs opacity-75 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div
                      className={
                        isDark
                          ? "pt-4 border-t border-white/10 flex items-center justify-between"
                          : "pt-4 border-t border-[#98D8D0]/40 flex items-center justify-between"
                      }
                    >
                      <span className={isDark ? "text-sm font-bold text-[#98D8D0]" : "text-sm font-bold text-[#1D8B94]"}>
                        {srv.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(srv.id)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer transition"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تب ۴: تقویم و بازه‌های کاری آزاد مطابق عکس دهم فیگما */}
          {activeTab === "schedule" && (
            <div
              className={
                isDark
                  ? "p-6 rounded-3xl border bg-[#04222B]/75 border-white/15 space-y-5 text-right shadow-xl"
                  : "p-6 rounded-3xl border bg-white/90 border-white space-y-5 text-right shadow-md"
              }
            >
              <div>
                <h1 className={isDark ? "text-xl font-extrabold text-white" : "text-xl font-extrabold text-[#04222B]"}>
                  تقویم و بازه‌های کاری آزاد
                </h1>
                <p className="text-xs opacity-75 mt-1">
                  روزها و ساعاتی که مراجعان مجاز به رزرو جلسه هستند را مشخص کنید
                </p>
              </div>

              <div className="space-y-3">
                {schedule.map((day) => (
                  <div
                    key={day.id}
                    className={
                      isDark
                        ? "p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4"
                        : "p-4 rounded-2xl border border-[#98D8D0]/50 bg-[#F2F8F6] flex flex-wrap items-center justify-between gap-4"
                    }
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.active}
                        onChange={(e) =>
                          handleScheduleChange(day.id, "active", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#1D8B94] cursor-pointer"
                      />
                      <span className={day.active ? "font-bold text-sm" : "font-medium text-sm opacity-50"}>
                        {day.dayName}
                      </span>
                    </label>

                    {day.active ? (
                      <div className="flex items-center gap-2.5 text-xs">
                        <span>از ساعت</span>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) =>
                            handleScheduleChange(day.id, "startTime", e.target.value)
                          }
                          className={
                            isDark
                              ? "px-3 py-1.5 rounded-xl border bg-[#04222B] border-white/20 text-white"
                              : "px-3 py-1.5 rounded-xl border bg-white border-[#98D8D0] text-[#04222B]"
                          }
                        />
                        <span>تا ساعت</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) =>
                            handleScheduleChange(day.id, "endTime", e.target.value)
                          }
                          className={
                            isDark
                              ? "px-3 py-1.5 rounded-xl border bg-[#04222B] border-white/20 text-white"
                              : "px-3 py-1.5 rounded-xl border bg-white border-[#98D8D0] text-[#04222B]"
                          }
                        />
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">غیرفعال (بدون پذیرش)</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                {scheduleSaved ? (
                  <span className="text-xs text-emerald-400 font-semibold">
                    ✓ تنظیمات ساعات کاری با موفقیت ذخیره شد.
                  </span>
                ) : (
                  <span></span>
                )}

                <button
                  type="button"
                  onClick={() => setScheduleSaved(true)}
                  className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-lg cursor-pointer transition"
                >
                  ذخیره تغییرات تقویم ✓
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* مودال نمایش جزئیات رزرو */}
      {selectedBooking && (
        <div 
          onClick={() => setSelectedBooking(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              isDark
                ? "max-w-md w-full p-6 rounded-3xl border bg-[#04222B] border-white/20 text-right space-y-4 shadow-2xl"
                : "max-w-md w-full p-6 rounded-3xl border bg-white border-[#98D8D0] text-right space-y-4 shadow-2xl"
            }
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base">جزئیات رزرو ({selectedBooking.id})</h3>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">نام مراجع:</span>
                <strong>{selectedBooking.clientName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">شماره تماس:</span>
                <strong dir="ltr">{selectedBooking.clientPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">ایمیل:</span>
                <strong dir="ltr">{selectedBooking.clientEmail}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">خدمت:</span>
                <strong>{selectedBooking.serviceTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">زمان جلسه:</span>
                <strong>{selectedBooking.dateTime}</strong>
              </div>
              <div className="pt-2">
                <span className="opacity-70 block mb-1">توضیحات مراجع:</span>
                <p
                  className={
                    isDark
                      ? "p-3 rounded-xl bg-white/5 text-xs leading-relaxed"
                      : "p-3 rounded-xl bg-[#E2F4F0] text-xs leading-relaxed"
                  }
                >
                  {selectedBooking.notes}
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleToggleBookingStatus(selectedBooking.id)}
                className={
                  selectedBooking.status === "confirmed"
                    ? "px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white cursor-pointer"
                    : "px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white cursor-pointer"
                }
              >
                {selectedBooking.status === "confirmed" ? "لغو این رزرو" : "تایید این رزرو"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1D8B94] text-white cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
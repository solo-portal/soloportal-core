"use client";

import { useState, useLayoutEffect, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type DashboardTab = "overview" | "bookings" | "services" | "schedule";

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  slug: string;
}

interface HostStats {
  total_bookings: number;
  upcoming_bookings: number;
  total_revenue: number;
  active_clients: number;
}

interface BookingItem {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: number;
  service_title?: string;
  start_time: string;
  end_time?: string;
  price?: number;
  status: "confirmed" | "cancelled" | string;
  notes?: string;
}

interface DashboardService {
  id: number;
  title: string;
  duration_minutes: number;
  description: string;
  price: number;
}

interface TimeSlotItem {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function FreelancerDashboardPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [userName, setUserName] = useState<string>("");
  const [userSlug, setUserSlug] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  // آمار
  const [stats, setStats] = useState<HostStats>({
    total_bookings: 0,
    upcoming_bookings: 0,
    total_revenue: 0,
    active_clients: 0,
  });

  // وضعیت‌های مدیریت رزروها
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // وضعیت‌های مدیریت خدمات
  const [services, setServices] = useState<DashboardService[]>([]);
  const [showServiceForm, setShowServiceForm] = useState<boolean>(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceTitle, setServiceTitle] = useState<string>("");
  const [serviceDuration, setServiceDuration] = useState<number>(60);
  const [servicePrice, setServicePrice] = useState<string>("");
  const [serviceDesc, setServiceDesc] = useState<string>("");
  const [isSavingService, setIsSavingService] = useState<boolean>(false);

  // وضعیت‌های مدیریت اسلات‌ها (متصل به سرویس)
  const [selectedSlotServiceId, setSelectedSlotServiceId] = useState<number | "">("");
  const [slotDate, setSlotDate] = useState<string>("");
  const [slotStartTime, setSlotStartTime] = useState<string>("10:00");
  const [slotEndTime, setSlotEndTime] = useState<string>("11:00");
  const [slots, setSlots] = useState<TimeSlotItem[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isCreatingSlot, setIsCreatingSlot] = useState<boolean>(false);
  const [slotMessage, setSlotMessage] = useState<string>("");

  const formatPersianNumber = (num: number) =>
    num.toLocaleString("fa-IR");

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setApiError("");
      // ۱. بررسی توکن و دریافت پروفایل واقعی فریلنسر
      const me = await apiRequest<UserProfile>("/auth/me", { method: "GET" }, true);
      setUserName(me.full_name);
      setUserSlug(me.slug);
      localStorage.setItem(
        "soloportal_demo_user",
        JSON.stringify({
          id: me.id,
          fullName: me.full_name,
          email: me.email,
          slug: me.slug,
        })
      );

      // ۲. دریافت هم‌زمان آمار، رزروها و خدمات از بک‌اند
      const [statsRes, bookingsRes, servicesRes] = await Promise.all([
        apiRequest<HostStats>("/bookings/host/stats", { method: "GET" }, true).catch(() => ({
          total_bookings: 0,
          upcoming_bookings: 0,
          total_revenue: 0,
          active_clients: 0,
        })),
        apiRequest<BookingItem[]>("/bookings/host", { method: "GET" }, true).catch(() => []),
        apiRequest<DashboardService[]>(`/users/${me.slug}/services`, { method: "GET" }, true).catch(
          () => []
        ),
      ]);

      setStats(statsRes);
      setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      const validServices = Array.isArray(servicesRes) ? servicesRes : [];
      setServices(validServices);

      if (validServices.length > 0) {
        setSelectedSlotServiceId((prev) => (prev === "" ? validServices[0].id : prev));
      }
    } catch {
      localStorage.removeItem("soloportal_token");
      localStorage.removeItem("soloportal_demo_user");
      router.replace("/login?redirect=/dashboard");
    }
  }, [router]);

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }

    const token = localStorage.getItem("soloportal_token");
    if (!token) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    // مقدار پیش‌فرض تاریخ امروز برای فرم اسلات
    const today = new Date().toISOString().split("T")[0];
    setSlotDate(today);

    setIsMounted(true);
    loadDashboardData();
  }, [router, loadDashboardData]);

  // محاسبه خودکار ساعت پایان بر اساس مدت سرویس انتخاب‌شده
  useEffect(() => {
    if (!selectedSlotServiceId || !slotStartTime) return;
    const srv = services.find((s) => s.id === Number(selectedSlotServiceId));
    if (!srv) return;

    const [hours, minutes] = slotStartTime.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const totalMinutes = hours * 60 + minutes + (srv.duration_minutes || 60);
    const endH = Math.floor((totalMinutes % (24 * 60)) / 60)
      .toString()
      .padStart(2, "0");
    const endM = (totalMinutes % 60).toString().padStart(2, "0");
    setSlotEndTime(`${endH}:${endM}`);
  }, [selectedSlotServiceId, slotStartTime, services]);

  // دریافت اسلات‌های سرویس انتخاب‌شده
  const fetchSlotsForService = useCallback(async () => {
    if (!userSlug || !selectedSlotServiceId) {
      setSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    try {
      const data = await apiRequest<TimeSlotItem[]>(
        `/users/${userSlug}/slots?service_id=${selectedSlotServiceId}`,
        { method: "GET" },
        true
      );
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [userSlug, selectedSlotServiceId]);

  useEffect(() => {
    if (activeTab === "schedule" && selectedSlotServiceId) {
      fetchSlotsForService();
    }
  }, [activeTab, selectedSlotServiceId, fetchSlotsForService]);

  const handleLogout = () => {
    localStorage.removeItem("soloportal_token");
    localStorage.removeItem("soloportal_demo_user");
    router.push("/login");
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const handleCopyPortalLink = () => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/book/${userSlug}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await apiRequest(`/bookings/${bookingId}`, { method: "DELETE" }, true);
      setBookings((prev) =>
        prev.map((item) => (item.id === bookingId ? { ...item, status: "cancelled" } : item))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: "cancelled" });
      }
      // به‌روزرسانی آمار
      const updatedStats = await apiRequest<HostStats>(
        "/bookings/host/stats",
        { method: "GET" },
        true
      ).catch(() => stats);
      setStats(updatedStats);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در لغو نوبت");
    }
  };

  const openCreateServiceForm = () => {
    setEditingServiceId(null);
    setServiceTitle("");
    setServiceDuration(60);
    setServicePrice("");
    setServiceDesc("");
    setShowServiceForm(true);
  };

  const openEditServiceForm = (srv: DashboardService) => {
    setEditingServiceId(srv.id);
    setServiceTitle(srv.title);
    setServiceDuration(srv.duration_minutes);
    setServicePrice(String(srv.price));
    setServiceDesc(srv.description || "");
    setShowServiceForm(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim() || !servicePrice.trim() || !userSlug) return;

    const numericPrice = Number(String(servicePrice).replace(/[^\d]/g, ""));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setApiError("لطفاً مبلغ معتبر (به عدد) وارد کنید.");
      return;
    }

    setIsSavingService(true);
    setApiError("");
    try {
      const payload = {
        title: serviceTitle.trim(),
        duration_minutes: Number(serviceDuration),
        price: numericPrice,
        description: serviceDesc.trim() || "جلسه مشاوره تخصصی آنلاین",
      };

      if (editingServiceId !== null) {
        const updated = await apiRequest<DashboardService>(
          `/users/${userSlug}/services/${editingServiceId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          true
        );
        setServices((prev) => prev.map((s) => (s.id === editingServiceId ? updated : s)));
      } else {
        const created = await apiRequest<DashboardService>(
          `/users/${userSlug}/services`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          true
        );
        setServices((prev) => [created, ...prev]);
        if (selectedSlotServiceId === "") {
          setSelectedSlotServiceId(created.id);
        }
      }

      setShowServiceForm(false);
      setEditingServiceId(null);
      setServiceTitle("");
      setServicePrice("");
      setServiceDesc("");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "خطا در ذخیره خدمت");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!userSlug) return;
    try {
      await apiRequest(`/users/${userSlug}/services/${serviceId}`, { method: "DELETE" }, true);
      const remaining = services.filter((s) => s.id !== serviceId);
      setServices(remaining);
      if (selectedSlotServiceId === serviceId) {
        setSelectedSlotServiceId(remaining.length > 0 ? remaining[0].id : "");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا در حذف خدمت");
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSlug || !selectedSlotServiceId || !slotDate || !slotStartTime || !slotEndTime) return;

    setIsCreatingSlot(true);
    setSlotMessage("");
    setApiError("");

    try {
      const startIso = `${slotDate}T${slotStartTime}:00`;
      const endIso = `${slotDate}T${slotEndTime}:00`;

      await apiRequest(
        `/users/${userSlug}/slots`,
        {
          method: "POST",
          body: JSON.stringify({
            service_id: Number(selectedSlotServiceId),
            start_time: startIso,
            end_time: endIso,
          }),
        },
        true
      );

      setSlotMessage("✓ بازه زمانی آزاد با موفقیت اضافه شد.");
      await fetchSlotsForService();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "خطا در ایجاد بازه زمانی");
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!userSlug) return;
    try {
      await apiRequest(`/users/${userSlug}/slots/${slotId}`, { method: "DELETE" }, true);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "امکان حذف این اسلات وجود ندارد.");
    }
  };

  const getServiceTitleById = (serviceId: number, fallback?: string) => {
    if (fallback) return fallback;
    const found = services.find((s) => s.id === serviceId);
    return found ? found.title : `سرویس #${serviceId}`;
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
              href={`/book/${userSlug}`}
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
          </div>
        </div>
      </header>

      {/* بدنه اصلی داشبورد */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 relative z-10">
        {/* سایدبار راست */}
        <aside className="lg:col-span-3 space-y-4">
          <div
            className={
              isDark
                ? "p-5 rounded-3xl border backdrop-blur-xl bg-[#04222B]/75 border-white/15 space-y-5 shadow-xl"
                : "p-5 rounded-3xl border backdrop-blur-xl bg-white/90 border-white space-y-5 shadow-md"
            }
          >
            <div
              className={
                isDark
                  ? "flex items-center gap-3 pb-4 border-b border-white/10"
                  : "flex items-center gap-3 pb-4 border-b border-[#98D8D0]/40"
              }
            >
              <div className="w-11 h-11 rounded-2xl bg-[#1D8B94] text-white font-bold flex items-center justify-center shrink-0">
                {userName ? userName.charAt(0) : "س"}
              </div>
              <div className="text-right overflow-hidden">
                <div className={isDark ? "font-bold text-sm text-white truncate" : "font-bold text-sm text-[#04222B] truncate"}>
                  {userName || "در حال بارگذاری..."}
                </div>
                <div dir="ltr" className={isDark ? "text-[11px] text-[#98D8D0] truncate text-right" : "text-[11px] text-[#1D8B94] truncate text-right"}>
                  /book/{userSlug}
                </div>
              </div>
            </div>

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
                  {formatPersianNumber(bookings.length)}
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
                href={`/book/${userSlug}`}
                className="block text-center w-full py-2 rounded-xl text-xs font-bold bg-[#1D8B94]/20 hover:bg-[#1D8B94] text-[#98D8D0] hover:text-white border border-[#4FB8B4]/30 transition"
              >
                مشاهده صفحه رزرو من
              </a>
            </div>
          </div>
        </aside>

        {/* محتوای اصلی سمت چپ */}
        <main className="lg:col-span-9 space-y-6">
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-right">
              {apiError}
            </div>
          )}

          {/* تب ۱: نمای کلی و آمار عملکرد */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="text-right">
                <h1 className={isDark ? "text-xl sm:text-2xl font-extrabold text-white" : "text-xl sm:text-2xl font-extrabold text-[#04222B]"}>
                  نمای کلی و آمار عملکرد
                </h1>
                <p className={isDark ? "text-xs text-[#98D8D0]/80 mt-1" : "text-xs text-[#0A3D4A]/80 mt-1"}>
                  خلاصه وضعیت جلسات، درآمد و مراجعان شما
                </p>
              </div>

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
                    {formatPersianNumber(stats.total_bookings || bookings.length)} جلسه
                  </div>
                  <span className="text-[11px] text-emerald-400 block">ثبت‌شده در سیستم</span>
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
                    {formatPersianNumber(stats.upcoming_bookings || confirmedCount)} جلسه
                  </div>
                  <span className="text-[11px] opacity-70 block">تایید شده و فعال</span>
                </div>

                <div
                  className={
                    isDark
                      ? "p-5 rounded-3xl border bg-[#04222B]/75 border-white/15 text-right space-y-2 shadow-lg"
                      : "p-5 rounded-3xl border bg-white/90 border-white text-right space-y-2 shadow-md"
                  }
                >
                  <span className="text-xs opacity-75">درآمد کل</span>
                  <div className={isDark ? "text-2xl font-extrabold text-white" : "text-2xl font-extrabold text-[#04222B]"}>
                    {formatPersianNumber(stats.total_revenue || 0)}
                  </div>
                  <span className="text-[11px] text-emerald-400 block">تومان</span>
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
                    {formatPersianNumber(stats.active_clients || 0)} نفر
                  </div>
                  <span className="text-[11px] opacity-70 block">مراجعان یکتا</span>
                </div>
              </div>

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

                {bookings.length === 0 ? (
                  <p className="text-xs opacity-70 py-4 text-center">هنوز رزروی ثبت نشده است.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs sm:text-sm">
                      <thead>
                        <tr className={isDark ? "border-b border-white/10 text-[#98D8D0]/80" : "border-b border-[#98D8D0]/40 text-[#0A3D4A]/80"}>
                          <th className="py-3 px-2 font-semibold">مراجع</th>
                          <th className="py-3 px-2 font-semibold">خدمت انتخابی</th>
                          <th className="py-3 px-2 font-semibold">تاریخ و زمان</th>
                          <th className="py-3 px-2 font-semibold">وضعیت</th>
                          <th className="py-3 px-2 font-semibold">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className={isDark ? "hover:bg-white/5" : "hover:bg-[#E2F4F0]/50"}>
                            <td className="py-3.5 px-2 font-bold">{b.client_name}</td>
                            <td className="py-3.5 px-2">{getServiceTitleById(b.service_id, b.service_title)}</td>
                            <td className="py-3.5 px-2">{formatDateTime(b.start_time)}</td>
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
                )}
              </div>
            </div>
          )}

          {/* تب ۲: مدیریت و پایش رزروها */}
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
                    مشاهده جزئیات مراجعان و لغو نوبت‌ها
                  </p>
                </div>

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
                    همه ({formatPersianNumber(bookings.length)})
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
                    تایید شده ({formatPersianNumber(confirmedCount)})
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
                    لغو شده ({formatPersianNumber(bookings.length - confirmedCount)})
                  </button>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <p className="text-xs opacity-70 py-6 text-center">موردی برای نمایش وجود ندارد.</p>
              ) : (
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
                          <td className="py-3.5 px-2 font-mono text-xs opacity-80">#{b.id}</td>
                          <td className="py-3.5 px-2 font-bold">{b.client_name}</td>
                          <td className="py-3.5 px-2">{getServiceTitleById(b.service_id, b.service_title)}</td>
                          <td className="py-3.5 px-2">{formatDateTime(b.start_time)}</td>
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
                            {b.status === "confirmed" && (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(b.id)}
                                className="px-3 py-1.5 rounded-xl text-xs bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white cursor-pointer transition"
                              >
                                لغو نوبت
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* تب ۳: تعریف و مدیریت خدمات */}
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
                  onClick={() => (showServiceForm ? setShowServiceForm(false) : openCreateServiceForm())}
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white shadow-md cursor-pointer transition"
                >
                  {showServiceForm ? "بستن فرم" : "+ افزودن خدمت جدید"}
                </button>
              </div>

              {showServiceForm && (
                <form
                  onSubmit={handleSaveService}
                  className={
                    isDark
                      ? "p-6 rounded-3xl border bg-[#04222B]/85 border-[#4FB8B4]/40 space-y-4 text-right shadow-xl"
                      : "p-6 rounded-3xl border bg-white border-[#1D8B94]/40 space-y-4 text-right shadow-md"
                  }
                >
                  <h3 className="font-bold text-sm">
                    {editingServiceId !== null ? "ویرایش اطلاعات خدمت:" : "اطلاعات خدمت جدید:"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">عنوان خدمت *</label>
                      <input
                        type="text"
                        value={serviceTitle}
                        onChange={(e) => setServiceTitle(e.target.value)}
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
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(Number(e.target.value))}
                        className={
                          isDark
                            ? "w-full px-3.5 py-2.5 rounded-xl border bg-[#0A3D4A] border-white/15 text-xs text-white focus:outline-none"
                            : "w-full px-3.5 py-2.5 rounded-xl border bg-[#F2F8F6] border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                        }
                      >
                        <option value={15}>۱۵ دقیقه</option>
                        <option value={30}>۳۰ دقیقه</option>
                        <option value={45}>۴۵ دقیقه</option>
                        <option value={60}>۶۰ دقیقه</option>
                        <option value={90}>۹۰ دقیقه</option>
                        <option value={120}>۱۲۰ دقیقه</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">تعرفه (تومان) *</label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        placeholder="مثلاً: 600000"
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
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
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
                      disabled={isSavingService}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-60 text-white cursor-pointer transition"
                    >
                      {isSavingService
                        ? "در حال ذخیره..."
                        : editingServiceId !== null
                        ? "به‌روزرسانی خدمت ✓"
                        : "ذخیره خدمت جدید ✓"}
                    </button>
                  </div>
                </form>
              )}

              {services.length === 0 ? (
                <div
                  className={
                    isDark
                      ? "p-8 rounded-3xl border bg-[#04222B]/75 border-white/15 text-center text-xs opacity-75"
                      : "p-8 rounded-3xl border bg-white/90 border-white text-center text-xs opacity-75"
                  }
                >
                  هنوز خدمتی تعریف نکرده‌اید. روی «+ افزودن خدمت جدید» کلیک کنید.
                </div>
              ) : (
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
                          {formatPersianNumber(srv.duration_minutes)} دقیقه
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
                            ? "pt-4 border-t border-white/10 flex items-center justify-between gap-2"
                            : "pt-4 border-t border-[#98D8D0]/40 flex items-center justify-between gap-2"
                        }
                      >
                        <span className={isDark ? "text-sm font-bold text-[#98D8D0]" : "text-sm font-bold text-[#1D8B94]"}>
                          {formatPersianNumber(srv.price)} تومان
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditServiceForm(srv)}
                            className="text-xs px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#1D8B94] text-current hover:text-white cursor-pointer transition"
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="text-xs px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer transition"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* تب ۴: تقویم و ساعات کاری (ساخت اسلات متصل به سرویس) */}
          {activeTab === "schedule" && (
            <div
              className={
                isDark
                  ? "p-6 rounded-3xl border bg-[#04222B]/75 border-white/15 space-y-6 text-right shadow-xl"
                  : "p-6 rounded-3xl border bg-white/90 border-white space-y-6 text-right shadow-md"
              }
            >
              <div>
                <h1 className={isDark ? "text-xl font-extrabold text-white" : "text-xl font-extrabold text-[#04222B]"}>
                  مدیریت بازه‌های زمانی (Time Slots)
                </h1>
                <p className="text-xs opacity-75 mt-1">
                  برای هر خدمت، تاریخ و ساعت شروع را انتخاب کنید؛ ساعت پایان به‌صورت خودکار محاسبه می‌شود
                </p>
              </div>

              {services.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                  ابتدا در تب «خدمات و تعرفه‌ها» حداقل یک خدمت ایجاد کنید تا بتوانید برای آن بازه زمانی تعریف کنید.
                </div>
              ) : (
                <>
                  {/* فرم ساخت تایم‌اسلات جدید */}
                  <form
                    onSubmit={handleCreateSlot}
                    className={
                      isDark
                        ? "p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4"
                        : "p-5 rounded-2xl border border-[#98D8D0]/50 bg-[#F2F8F6] space-y-4"
                    }
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5">۱. انتخاب خدمت *</label>
                        <select
                          value={selectedSlotServiceId}
                          onChange={(e) => setSelectedSlotServiceId(Number(e.target.value))}
                          className={
                            isDark
                              ? "w-full px-3 py-2.5 rounded-xl border bg-[#04222B] border-white/20 text-xs text-white focus:outline-none"
                              : "w-full px-3 py-2.5 rounded-xl border bg-white border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                          }
                        >
                          {services.map((srv) => (
                            <option key={srv.id} value={srv.id}>
                              {srv.title} ({formatPersianNumber(srv.duration_minutes)} دقیقه)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5">۲. تاریخ *</label>
                        <input
                          type="date"
                          value={slotDate}
                          onChange={(e) => setSlotDate(e.target.value)}
                          className={
                            isDark
                              ? "w-full px-3 py-2.5 rounded-xl border bg-[#04222B] border-white/20 text-xs text-white focus:outline-none"
                              : "w-full px-3 py-2.5 rounded-xl border bg-white border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5">۳. ساعت شروع *</label>
                        <input
                          type="time"
                          value={slotStartTime}
                          onChange={(e) => setSlotStartTime(e.target.value)}
                          className={
                            isDark
                              ? "w-full px-3 py-2.5 rounded-xl border bg-[#04222B] border-white/20 text-xs text-white focus:outline-none"
                              : "w-full px-3 py-2.5 rounded-xl border bg-white border-[#98D8D0] text-xs text-[#04222B] focus:outline-none"
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5">۴. ساعت پایان (خودکار)</label>
                        <input
                          type="time"
                          value={slotEndTime}
                          readOnly
                          className={
                            isDark
                              ? "w-full px-3 py-2.5 rounded-xl border bg-white/5 border-white/10 text-xs text-[#98D8D0] cursor-not-allowed"
                              : "w-full px-3 py-2.5 rounded-xl border bg-[#E2F4F0]/60 border-[#98D8D0]/50 text-xs text-[#1D8B94] cursor-not-allowed"
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {slotMessage ? (
                        <span className="text-xs text-emerald-400 font-semibold">{slotMessage}</span>
                      ) : (
                        <span></span>
                      )}

                      <button
                        type="submit"
                        disabled={isCreatingSlot}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-60 text-white shadow-md cursor-pointer transition"
                      >
                        {isCreatingSlot ? "در حال ثبت..." : "+ افزودن تایم‌اسلات آزاد"}
                      </button>
                    </div>
                  </form>

                  {/* لیست اسلات‌های تعریف‌شده برای سرویس انتخابی */}
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold">بازه‌های ثبت‌شده برای این خدمت:</h2>

                    {isLoadingSlots ? (
                      <p className="text-xs opacity-70">در حال بارگذاری بازه‌ها...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-xs opacity-70 py-4">
                        هنوز بازه زمانی برای این خدمت ثبت نشده است.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={
                              isDark
                                ? "p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 text-xs"
                                : "p-4 rounded-2xl border border-[#98D8D0]/50 bg-white flex items-center justify-between gap-3 text-xs"
                            }
                          >
                            <div className="space-y-1">
                              <div className="font-bold">{formatDateTime(slot.start_time)}</div>
                              <div>
                                {slot.is_booked ? (
                                  <span className="text-[11px] text-amber-400 font-semibold">
                                    ● رزرو شده
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-emerald-400 font-semibold">
                                    ● آزاد
                                  </span>
                                )}
                              </div>
                            </div>

                            {!slot.is_booked && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer transition"
                              >
                                حذف
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
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
              <h3 className="font-bold text-base">جزئیات رزرو (#{selectedBooking.id})</h3>
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
                <strong>{selectedBooking.client_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">شماره تماس:</span>
                <strong dir="ltr">{selectedBooking.client_phone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">ایمیل:</span>
                <strong dir="ltr">{selectedBooking.client_email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">خدمت:</span>
                <strong>{getServiceTitleById(selectedBooking.service_id, selectedBooking.service_title)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">زمان جلسه:</span>
                <strong>{formatDateTime(selectedBooking.start_time)}</strong>
              </div>
              {selectedBooking.notes && (
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
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              {selectedBooking.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white cursor-pointer"
                >
                  لغو این رزرو
                </button>
              )}
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
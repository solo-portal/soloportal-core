"use client";

import { useState, useLayoutEffect, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface FreelancerProfile {
  id: number;
  full_name: string;
  email: string;
  slug: string;
}

interface ServiceOption {
  id: number;
  title: string;
  duration_minutes: number;
  description: string;
  price: number;
}

interface TimeSlotOption {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

interface BookingResponse {
  id: number;
  status: string;
}

export default function DynamicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // اطلاعات فریلنسر و خدمات از بک‌اند
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [slots, setSlots] = useState<TimeSlotOption[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [notFoundError, setNotFoundError] = useState<string>("");

  // مراحل ویزارد: 1 = انتخاب خدمت | 2 = انتخاب زمان | 3 = مشخصات و تایید
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // فیلدهای فرم مراجع
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // مودال الزام به لاگین
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // نتیجه تایید نهایی
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);

  const formatPersianNumber = (num: number) => num.toLocaleString("fa-IR");

  const formatSlotDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("fa-IR", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem("soloportal_theme");
    if (savedTheme !== null) {
      setIsDark(savedTheme === "dark");
    }

    // اگر کاربر لاگین کرده باشد، نام و ایمیلش به‌صورت خودکار پر می‌شود
    const savedUser = localStorage.getItem("soloportal_demo_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.fullName) setClientName(parsed.fullName);
        if (parsed.email) setClientEmail(parsed.email);
      } catch {
        // نادیده گرفتن
      }
    }

    setIsMounted(true);
  }, []);

  // دریافت اطلاعات فریلنسر و خدمات از بک‌اند
  useEffect(() => {
    if (!slug) return;

    const loadPortalData = async () => {
      setIsLoadingPage(true);
      setNotFoundError("");
      try {
        const [profileData, servicesData] = await Promise.all([
          apiRequest<FreelancerProfile>(`/users/${slug}`, { method: "GET" }),
          apiRequest<ServiceOption[]>(`/users/${slug}/services`, { method: "GET" }),
        ]);

        setFreelancer(profileData);
        const validServices = Array.isArray(servicesData) ? servicesData : [];
        setServices(validServices);
        if (validServices.length > 0) {
          setSelectedServiceId(validServices[0].id);
        }
      } catch (err: unknown) {
        setNotFoundError(
          err instanceof Error ? err.message : "پورتال مورد نظر یافت نشد."
        );
      } finally { 
        setIsLoadingPage(false);
      }
    };

    loadPortalData();
  }, [slug]);

  // دریافت اسلات‌های آزاد هنگام ورود به مرحله ۲ یا تغییر خدمت
  const fetchAvailableSlots = useCallback(async () => {
    if (!slug || !selectedServiceId) return;
    setIsLoadingSlots(true);
    try {
      const data = await apiRequest<TimeSlotOption[]>(
        `/users/${slug}/slots?service_id=${selectedServiceId}`,
        { method: "GET" }
      );
      const available = (Array.isArray(data) ? data : []).filter((s) => !s.is_booked);
      setSlots(available);
    } catch {
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [slug, selectedServiceId]);

  useEffect(() => {
    if (step === 2 && selectedServiceId) {
      fetchAvailableSlots();
    }
  }, [step, selectedServiceId, fetchAvailableSlots]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("soloportal_theme", newTheme ? "dark" : "light");
  };

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0] || null;
  const selectedSlot =
    slots.find((sl) => sl.id === selectedSlotId) || null;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setFormError("لطفاً نام و نام خانوادگی، ایمیل و شماره موبایل خود را وارد کنید.");
      return;
    }

    if (!selectedService || !selectedSlot) {
      setFormError("لطفاً خدمت و بازه زمانی را انتخاب کنید.");
      return;
    }

    // بررسی وضعیت لاگین کاربر در localStorage
    const token = localStorage.getItem("soloportal_token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiRequest<BookingResponse>(
        "/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            slot_id: selectedSlot.id,
            service_id: selectedService.id,
            client_name: clientName.trim(),
            client_email: clientEmail.trim(),
            client_phone: clientPhone.trim(),
            notes: notes.trim() || undefined,
          }),
        },
        true
      );

      setConfirmedBookingId(created.id || Math.floor(100 + Math.random() * 900));
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetWizard = () => {
    setConfirmedBookingId(null);
    setStep(1);
    setSelectedSlotId(null);
    setNotes("");
    setFormError("");
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
      {/* هاله‌های نوری پس‌زمینه */}
      <div
        className={
          isDark
            ? "absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#1D8B94]/25"
            : "absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#98D8D0]/35"
        }
      ></div>
      <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#4FB8B4]/15"></div>

      {/* هدر بالا */}
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

      {/* باکس مرکزی پورتال رزرو */}
      <main className="max-w-3xl w-full mx-auto px-6 py-10 relative z-10">
        {isLoadingPage ? (
          <div
            className={
              isDark
                ? "border p-10 rounded-3xl backdrop-blur-xl bg-[#04222B]/75 border-white/15 text-center text-sm"
                : "border p-10 rounded-3xl backdrop-blur-xl bg-white/90 border-white text-center text-sm"
            }
          >
            در حال بارگذاری اطلاعات پورتال...
          </div>
        ) : notFoundError || !freelancer ? (
          <div
            className={
              isDark
                ? "border p-10 rounded-3xl backdrop-blur-xl bg-[#04222B]/75 border-white/15 text-center space-y-4"
                : "border p-10 rounded-3xl backdrop-blur-xl bg-white/90 border-white text-center space-y-4"
            }
          >
            <h2 className="text-lg font-bold text-rose-400">
              پورتال رزرو برای «{slug}» یافت نشد
            </h2>
            <p className="text-xs opacity-75">
              ممکن است آدرس اشتباه وارد شده باشد یا هنوز این کاربر در سیستم ثبت‌نام نکرده باشد.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] text-white"
            >
              بازگشت به صفحه اصلی
            </a>
          </div>
        ) : ( 
          <div
            className={
              isDark
                ? "border p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-[#04222B]/75 border-white/15 shadow-2xl space-y-6"
                : "border p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/90 border-white shadow-xl space-y-6"
            }
          >
            {/* هدر پروفایل مشاور */}
            <div
              className={
                isDark
                  ? "flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-white/10"
                  : "flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-[#98D8D0]/40"
              }
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#1D8B94] text-white font-bold text-base flex items-center justify-center shadow-sm">
                  {freelancer.full_name.charAt(0)}
                </div>
                <div className="text-right">
                  <h1 className={isDark ? "font-bold text-base sm:text-lg text-white" : "font-bold text-base sm:text-lg text-[#04222B]"}>
                    {freelancer.full_name}
                  </h1>
                  <p className={isDark ? "text-xs text-[#98D8D0]" : "text-xs text-[#1D8B94]"}>
                    پورتال اختصاصی رزرو آنلاین • /book/{freelancer.slug}
                  </p>
                </div>
              </div>

              <span
                className={
                  isDark
                    ? "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                    : "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/25"
                }
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                پورتال فعال
              </span>
            </div>

            {/* نوار مراحل ۳ گانه (بدون امکان پرش بدون تکمیل مرحله قبل) */}
            {confirmedBookingId === null && (
              <div
                className={
                  isDark
                    ? "grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs"
                    : "grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#E2F4F0] border border-[#98D8D0]/40 text-xs"
                }
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={
                    step === 1
                      ? "py-2.5 px-2 rounded-xl font-bold bg-[#1D8B94] text-white shadow cursor-pointer transition"
                      : isDark
                      ? "py-2.5 px-2 rounded-xl font-medium text-[#98D8D0] hover:text-white cursor-pointer transition"
                      : "py-2.5 px-2 rounded-xl font-medium text-[#0A3D4A] hover:text-black cursor-pointer transition"
                  }
                >
                  ۱. انتخاب خدمت
                </button>

                <button
                  type="button"
                  disabled={!selectedServiceId}
                  onClick={() => {
                    if (selectedServiceId) setStep(2);
                  }}
                  className={
                    step === 2
                      ? "py-2.5 px-2 rounded-xl font-bold bg-[#1D8B94] text-white shadow cursor-pointer transition"
                      : isDark
                      ? "py-2.5 px-2 rounded-xl font-medium text-[#98D8D0] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                      : "py-2.5 px-2 rounded-xl font-medium text-[#0A3D4A] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  }
                >
                  ۲. انتخاب زمان
                </button>

                <button
                  type="button"
                  disabled={!selectedSlotId}
                  onClick={() => {
                    if (selectedSlotId) setStep(3);
                  }}
                  className={
                    step === 3
                      ? "py-2.5 px-2 rounded-xl font-bold bg-[#1D8B94] text-white shadow cursor-pointer transition"
                      : isDark
                      ? "py-2.5 px-2 rounded-xl font-medium text-[#98D8D0]/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                      : "py-2.5 px-2 rounded-xl font-medium text-[#0A3D4A]/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
                  }
                >
                  ۳. مشخصات و تایید
                </button>
              </div>
            )}

            {/* مرحله ۱: انتخاب خدمت */}
            {confirmedBookingId === null && step === 1 && (
              <div className="space-y-4 text-right">
                <p className={isDark ? "text-xs sm:text-sm font-semibold text-[#E2F4F0]" : "text-xs sm:text-sm font-semibold text-[#04222B]"}>
                  لطفاً یکی از خدمات زیر را انتخاب نمایید:
                </p>

                {services.length === 0 ? (
                  <p className="text-xs opacity-75 py-6 text-center">
                    این مشاور هنوز خدمتی تعریف نکرده است.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => {
                      const isSelected = selectedServiceId === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            setSelectedSlotId(null);
                          }}
                          className={
                            isSelected
                              ? isDark
                                ? "p-4 sm:p-5 rounded-2xl border-2 border-[#4FB8B4] bg-[#1D8B94]/20 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition shadow-md"
                                : "p-4 sm:p-5 rounded-2xl border-2 border-[#1D8B94] bg-[#E2F4F0] flex flex-wrap items-center justify-between gap-4 cursor-pointer transition shadow-sm"
                              : isDark
                              ? "p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition"
                              : "p-4 sm:p-5 rounded-2xl border border-[#98D8D0]/50 bg-white hover:bg-[#F2F8F6] flex flex-wrap items-center justify-between gap-4 cursor-pointer transition"
                          }
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={
                                  isSelected
                                    ? "w-3.5 h-3.5 rounded-full bg-[#4FB8B4] inline-block"
                                    : "w-3.5 h-3.5 rounded-full border border-current opacity-40 inline-block"
                                }
                              ></span>
                              <h2 className={isDark ? "font-bold text-sm sm:text-base text-white" : "font-bold text-sm sm:text-base text-[#04222B]"}>
                                {service.title}
                              </h2>
                              <span
                                className={
                                  isDark
                                    ? "text-[11px] px-2 py-0.5 rounded-lg bg-white/10 text-[#98D8D0]"
                                    : "text-[11px] px-2 py-0.5 rounded-lg bg-[#1D8B94]/10 text-[#1D8B94]"
                                }
                              >
                                {formatPersianNumber(service.duration_minutes)} دقیقه
                              </span>
                            </div>
                            <p className={isDark ? "text-xs text-[#E2F4F0]/70 pr-5" : "text-xs text-[#0A3D4A]/80 pr-5"}>
                              {service.description}
                            </p>
                          </div>

                          <div className="text-left shrink-0">
                            <span className={isDark ? "text-sm font-bold text-[#98D8D0]" : "text-sm font-bold text-[#1D8B94]"}>
                              {formatPersianNumber(service.price)} تومان
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <a
                    href="/"
                    className={
                      isDark
                        ? "text-xs text-[#98D8D0] hover:text-white transition"
                        : "text-xs text-[#1D8B94] hover:text-[#04222B] transition"
                    }
                  >
                    ← بازگشت به صفحه اصلی
                  </a>

                  <button
                    type="button"
                    disabled={!selectedServiceId}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-50 text-white shadow-lg cursor-pointer transition"
                  >
                    مرحله بعد: انتخاب تاریخ و ساعت ←
                  </button>
                </div>
              </div>
            )}

            {/* مرحله ۲: انتخاب اسلات آزاد */}
            {confirmedBookingId === null && step === 2 && (
              <div className="space-y-6 text-right">
                <div className="space-y-3">
                  <p className={isDark ? "text-xs sm:text-sm font-semibold text-[#E2F4F0]" : "text-xs sm:text-sm font-semibold text-[#04222B]"}>
                    بازه‌های زمانی آزاد برای «{selectedService?.title}»:
                  </p>

                  {isLoadingSlots ? (
                    <p className="text-xs opacity-75 py-6 text-center">
                      در حال دریافت وقت‌های آزاد...
                    </p>
                  ) : slots.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 text-center">
                      در حال حاضر هیچ بازه زمانی آزادی برای این خدمت ثبت نشده است.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slots.map((slot) => {
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={
                              isSelected
                                ? "p-3.5 rounded-2xl text-xs font-bold bg-[#1D8B94] text-white border border-[#4FB8B4] shadow-md cursor-pointer text-right transition"
                                : isDark
                                ? "p-3.5 rounded-2xl text-xs font-medium bg-white/5 hover:bg-white/15 text-[#98D8D0] border border-white/10 cursor-pointer text-right transition"
                                : "p-3.5 rounded-2xl text-xs font-medium bg-white hover:bg-[#E2F4F0] text-[#1D8B94] border border-[#98D8D0]/50 cursor-pointer text-right transition"
                            }
                          >
                            📅 {formatSlotDateTime(slot.start_time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={
                        isDark
                        ? "px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#E2F4F0] cursor-pointer transition"
                        : "px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E2F4F0] hover:bg-[#98D8D0]/40 text-[#04222B] cursor-pointer transition"
                    }
                  >
                    → مرحله قبل
                  </button>

                  <button
                    type="button"
                    disabled={!selectedSlotId}
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-50 text-white shadow-lg cursor-pointer transition"
                  >
                    مرحله بعد: وارد کردن مشخصات ←
                  </button>
                </div>
              </div>
            )}

            {/* مرحله ۳: فرم مشخصات مراجع و تایید نهایی */}
            {confirmedBookingId === null && step === 3 && selectedService && selectedSlot && (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-right">
                <div
                  className={
                    isDark
                      ? "p-4 rounded-2xl bg-[#1D8B94]/15 border border-[#4FB8B4]/30 flex flex-wrap items-center justify-between gap-2 text-xs"
                      : "p-4 rounded-2xl bg-[#E2F4F0] border border-[#1D8B94]/25 flex flex-wrap items-center justify-between gap-2 text-xs"
                  }
                >
                  <div>
                    <span className="opacity-75">خدمت انتخابی: </span>
                    <strong className={isDark ? "text-white" : "text-[#04222B]"}>
                      {selectedService.title} ({formatPersianNumber(selectedService.duration_minutes)} دقیقه)
                    </strong>
                  </div>
                  <div>
                    <span className="opacity-75">زمان جلسه: </span>
                    <strong className={isDark ? "text-[#98D8D0]" : "text-[#1D8B94]"}>
                      {formatSlotDateTime(selectedSlot.start_time)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">نام و نام خانوادگی مراجع *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="مثلاً: سارا جلالی"
                      className={
                        isDark
                          ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4]"
                          : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94]"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">شماره موبایل *</label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="09123456789"
                      className={
                        isDark
                          ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4] text-left"
                          : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94] text-left"
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">نشانی ایمیل (جهت ارسال لینک جلسه) *</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className={
                      isDark
                        ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4] text-left"
                        : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94] text-left"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">توضیحات یا موضوع جلسه (اختیاری)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="موضوعی که می‌خواهید در جلسه مطرح کنید را بنویسید..."
                    className={
                      isDark
                        ? "w-full px-4 py-2.5 rounded-xl border bg-white/5 border-white/15 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[#4FB8B4]"
                        : "w-full px-4 py-2.5 rounded-xl border bg-white border-[#98D8D0]/60 text-sm text-[#04222B] placeholder:text-[#04222B]/35 focus:outline-none focus:border-[#1D8B94]"
                    }
                  />
                </div>

                {formError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                    {formError}
                  </p>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={
                      isDark
                        ? "px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#E2F4F0] cursor-pointer transition"
                        : "px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E2F4F0] hover:bg-[#98D8D0]/40 text-[#04222B] cursor-pointer transition"
                    }
                  >
                    → تغییر زمان
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] disabled:opacity-60 text-white shadow-lg cursor-pointer transition"
                  >
                    {isSubmitting ? "در حال ثبت نهایی..." : "تایید و ثبت نهایی نوبت ✓"}
                  </button>
                </div>
              </form>
            )}

            {/* صفحه رسید تایید رزرو (بدون دکمه ورود به پنل فریلنسر) */}
            {confirmedBookingId !== null && selectedService && selectedSlot && (
              <div className="py-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h2 className={isDark ? "text-xl font-extrabold text-white" : "text-xl font-extrabold text-[#04222B]"}>
                    نوبت شما با موفقیت ثبت شد!
                  </h2>
                  <p className={isDark ? "text-xs text-[#98D8D0]" : "text-xs text-[#0A3D4A]/80"}>
                    کد پیگیری رزرو: <strong dir="ltr">SP-{confirmedBookingId}</strong> • جزئیات به ایمیل {clientEmail} ارسال شد.
                  </p>
                </div>

                <div
                  className={
                    isDark
                      ? "max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 text-right text-xs space-y-2"
                      : "max-w-md mx-auto p-4 rounded-2xl bg-[#E2F4F0]/70 border border-[#98D8D0]/50 text-right text-xs space-y-2"
                  }
                >
                  <div className="flex justify-between">
                    <span className="opacity-75">مراجع:</span>
                    <strong>{clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">مشاور:</span>
                    <strong>{freelancer.full_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">خدمت:</span>
                    <strong>{selectedService.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">تاریخ و ساعت:</span>
                    <strong>{formatSlotDateTime(selectedSlot.start_time)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">مبلغ:</span>
                    <strong>{formatPersianNumber(selectedService.price)} تومان</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetWizard}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white cursor-pointer transition"
                  >
                    رزرو یک نوبت جدید
                  </button>
                  <a
                    href="/"
                    className={
                      isDark
                        ? "px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#E2F4F0] transition"
                        : "px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E2F4F0] hover:bg-[#98D8D0]/40 text-[#04222B] transition"
                    }
                  >
                    بازگشت به صفحه اصلی
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* مودال الزام به احراز هویت */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={
              isDark
                ? "max-w-md w-full p-6 rounded-3xl border bg-[#04222B] border-white/20 text-center space-y-5 shadow-2xl"
                : "max-w-md w-full p-6 rounded-3xl border bg-white border-[#98D8D0] text-center space-y-5 shadow-2xl"
            }
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1D8B94]/20 text-[#4FB8B4] flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className={isDark ? "text-lg font-extrabold text-white" : "text-lg font-extrabold text-[#04222B]"}>
                برای رزرو نوبت باید احراز هویت شوید
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید تا نوبت به نام شما ثبت شود.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/login?redirect=/book/${slug}`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1D8B94] hover:bg-[#4FB8B4] text-white cursor-pointer transition"
              >
                رفتن به صفحه ورود / ثبت‌نام
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className={
                  isDark
                    ? "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#E2F4F0] cursor-pointer transition"
                    : "w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#E2F4F0] hover:bg-[#98D8D0]/40 text-[#04222B] cursor-pointer transition"
                }
              >
                بازگشت به همین صفحه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* فوتر ساده */}
      <footer className="py-5 text-center text-xs opacity-70 relative z-10">
        © ۱۴۰۵ سولوپورتال (SoloPortal) - پورتال رزرو آنلاین
      </footer>
    </div>
  );
}
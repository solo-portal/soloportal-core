import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* هاله‌های نوری پس‌زمینه */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* منوی بالای صفحه (Navbar) */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            سولو<span className="text-blue-400">پورتال</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/shaqayeq"
            className="text-sm text-slate-300 hover:text-white transition hidden sm:block"
          >
            نمونه پروفایل
          </Link>
          <Link
            href="/dashboard"
            className="text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md transition"
          >
            پنل متخصصان
          </Link>
        </div>
      </header>

      {/* بخش اصلی وسط صفحه (Hero Section) */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center z-10">
        <div className="inline-flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          سامانه جامع رزرواسیون و مدیریت جلسات کاری
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          مدیریت هوشمند نوبت‌ها <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-slate-200 bg-clip-text text-transparent">
            بدون تداخل و هماهنگی‌های دستی
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          پرتال اختصاصی خود را ایجاد کنید، لینک رزرو را در اختیار مراجعین قرار دهید و فرآیند بررسی زمان‌های خالی، جلوگیری از تداخل نوبت و تسویه مالی را به‌صورت خودکار مدیریت کنید.
        </p>

        {/* دکمه‌های اصلی */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-8 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            ورود به داشبورد مدیریت
          </Link>

          <Link
            href="/shaqayeq"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-semibold py-3.5 px-8 rounded-xl backdrop-blur-md transition"
          >
            مشاهده پروفایل نمونه (شقایق خوبکار)
          </Link>
        </div>

        {/* ۳ کارت شیشه‌ای ویژگی‌ها با آیکون‌های رسمی SVG */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right">
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-lg hover:border-white/15 transition">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-2">کنترل همزمانی و قفل نوبت</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              جلوگیری کامل از ثبت رزروهای متداخل (Double Booking) از طریق مکانیزم قفل‌گذاری روی بازه‌های زمانی.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-lg hover:border-white/15 transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-2">تسویه و ثبت قطعی</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              نهایی‌سازی خودکار جلسات پس از تایید تراکنش و حذف فرآیندهای زمان‌بر تایید دستی در پیام‌رسان‌ها.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-lg hover:border-white/15 transition">
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-2">پروفایل و آدرس اختصاصی</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              ایجاد صفحه رسمی معرفی خدمات و تقویم کاری با لینک اختصاصی جهت اشتراک‌گذاری مستقیم با مشتریان.
            </p>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer className="w-full text-center py-6 text-xs text-slate-500 border-t border-white/5 z-10">
        سولو پورتال لایت — پروژه مهندسی نرم‌افزار
      </footer>
    </main>
  );
}
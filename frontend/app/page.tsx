export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-cyan-100">
      {/* هدر بالای صفحه */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            س
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            سولو<span className="text-cyan-600">پورتال</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-cyan-600 transition">صفحه اصلی</a>
          <a href="#" className="hover:text-cyan-600 transition">ویژگی‌ها</a>
          <a href="#" className="hover:text-cyan-600 transition">قیمت‌گذاری</a>
          <a href="#" className="hover:text-cyan-600 transition">درباره ما</a>
          <a href="#" className="hover:text-cyan-600 transition">تماس با ما</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-cyan-600 px-4 py-2 transition">
            ورود
          </a>
          <a href="/dashboard" className="text-sm font-medium bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition">
            ثبت‌نام
          </a>
        </div>
      </header>

      {/* بخش اصلی (Hero Section) */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* ستون متن در سمت راست */}
        <div className="lg:col-span-6 space-y-6 text-right">
          <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></span>
            سامانه جامع رزرواسیون و مدیریت جلسات
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            به سادگی نوبت رزرو کنید، <br />
            <span className="text-cyan-600">زمان شما ارزشمند است!</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
            با سولوپورتال، به راحتی نوبت‌های خود را رزرو کنید. مناسب برای مشاوران، پزشکان، کارشناسان و تمام کسانی که زمان دیگران برایشان مهم است.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a href="/dashboard" className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-7 py-3.5 rounded-xl shadow-sm transition flex items-center gap-2">
              شروع کنید
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <a href="#" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-7 py-3.5 rounded-xl transition">
              مشاهده دمو
            </a>
          </div>
        </div>

        {/* ستون پیش‌نمایش کارت تقویم و رزرو در سمت چپ */}
        <div className="lg:col-span-6">
          <div className="bg-slate-50 border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">شقایق خوبکار</h3>
                    <p className="text-xs text-slate-500">مشاور و برنامه‌ریز تحصیلی</p>
                  </div>
                </div>
                <span className="text-xs bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg font-medium">۴۵ دقیقه</span>
              </div>
              <div className="text-xs font-semibold text-slate-700">انتخاب زمان آزاد:</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-cyan-600 text-white text-center py-2 rounded-lg text-xs font-medium shadow-sm">۰۹:۰۰</div>
                <div className="bg-slate-100 text-slate-600 text-center py-2 rounded-lg text-xs font-medium">۱۰:۰۰</div>
                <div className="bg-slate-100 text-slate-600 text-center py-2 rounded-lg text-xs font-medium">۱۱:۰۰</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* بخش ویژگی‌ها (چرا سولوپورتال؟) */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">چرا سولوپورتال؟</h2>
          <p className="text-slate-600 text-sm sm:text-base">ما به شما کمک می‌کنیم تا زمان خود را بهتر مدیریت کنید.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* کارت اول */}
          <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 p-8 rounded-2xl transition text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">امنیت بالا</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود.</p>
          </div>

          {/* کارت دوم */}
          <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 p-8 rounded-2xl transition text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">تقویم شمسی</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">پشتیبانی کامل از تقویم شمسی و تعطیلات رسمی ایران.</p>
          </div>

          {/* کارت سوم */}
          <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 p-8 rounded-2xl transition text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">رزرو سریع</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">در چند ثانیه نوبت خود را رزرو کنید.</p>
          </div>{/* کارت چهارم */}
          <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 p-8 rounded-2xl transition text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-bold text-slate-900 text-base">دسترسی در همه‌جا</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">مناسب برای موبایل، تبلت و دسکتاپ.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
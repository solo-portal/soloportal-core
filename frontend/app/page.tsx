export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1B2E] via-[#112A46] to-[#1B3B5A] text-[#C4D2E1] font-sans selection:bg-[#34506D]">
      {/* هدر بالای صفحه */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#34506D]/40 bg-[#0A1B2E]/75 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#34506D] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            س
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            سولو<span className="text-[#7A8CA6]">پورتال</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1B2C4]">
          <a href="#" className="hover:text-white transition">صفحه اصلی</a>
          <a href="#" className="hover:text-white transition">ویژگی‌ها</a>
          <a href="#" className="hover:text-white transition">قیمت‌گذاری</a>
          <a href="#" className="hover:text-white transition">درباره ما</a>
          <a href="#" className="hover:text-white transition">تماس با ما</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm font-medium text-[#A1B2C4] hover:text-white px-4 py-2 transition">
            ورود
          </a>
          <a href="/dashboard" className="text-sm font-medium bg-[#34506D] hover:bg-[#557392] text-white px-5 py-2.5 rounded-xl shadow-md transition font-bold">
            ثبت‌نام
          </a>
        </div>
      </header>

      {/* بخش اصلی (Hero Section) */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* ستون متن در سمت راست */}
        <div className="lg:col-span-6 space-y-6 text-right">
          <div className="inline-flex items-center gap-2 bg-[#112A46] border border-[#34506D]/50 text-[#C4D2E1] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#7A8CA6] animate-pulse"></span>
            سامانه جامع رزرواسیون و مدیریت جلسات
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            به سادگی نوبت رزرو کنید، <br />
            <span className="text-[#7A8CA6]">زمان شما ارزشمند است!</span>
          </h1>

          <p className="text-[#A1B2C4] text-base sm:text-lg leading-relaxed max-w-xl">
            با سولوپورتال، به راحتی نوبت‌های خود را رزرو کنید. مناسب برای مشاوران، پزشکان، کارشناسان و تمام کسانی که زمان دیگران برایشان مهم است.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a href="/dashboard" className="bg-[#34506D] hover:bg-[#557392] text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2">
              شروع کنید
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <a href="#" className="bg-[#112A46]/80 hover:bg-[#1B3B5A] text-[#C4D2E1] border border-[#34506D]/40 font-medium px-7 py-3.5 rounded-xl transition">
              مشاهده دمو
            </a>
          </div>
        </div>

        {/* ستون پیش‌نمایش کارت تقویم و رزرو در سمت چپ */}
        <div className="lg:col-span-6">
          <div className="bg-[#112A46]/80 border border-[#34506D]/50 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="bg-[#0A1B2E]/90 rounded-2xl p-6 border border-[#34506D]/40 shadow-inner space-y-4"><div className="flex items-center justify-between border-b border-[#34506D]/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3B5A] border border-[#34506D]"></div>
                  <div>
                    <h3 className="font-bold text-white text-sm">شقایق خوبکار</h3>
                    <p className="text-xs text-[#A1B2C4]">مشاور و برنامه‌ریز تحصیلی</p>
                  </div>
                </div>
                <span className="text-xs bg-[#112A46] text-[#C4D2E1] px-2.5 py-1 rounded-lg font-medium border border-[#34506D]/40">۴۵ دقیقه</span>
              </div>
              <div className="text-xs font-semibold text-[#A1B2C4]">انتخاب زمان آزاد:</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#34506D] text-white text-center py-2 rounded-lg text-xs font-medium shadow-sm">۰۹:۰۰</div>
                <div className="bg-[#112A46] text-[#A1B2C4] border border-[#34506D]/40 text-center py-2 rounded-lg text-xs font-medium">۱۰:۰۰</div>
                <div className="bg-[#112A46] text-[#A1B2C4] border border-[#34506D]/40 text-center py-2 rounded-lg text-xs font-medium">۱۱:۰۰</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* بخش ویژگی‌ها (چرا سولوپورتال؟) */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-[#34506D]/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">چرا سولوپورتال؟</h2>
          <p className="text-[#A1B2C4] text-sm sm:text-base">ما به شما کمک می‌کنیم تا زمان خود را بهتر مدیریت کنید.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* کارت اول */}
          <div className="bg-[#112A46]/70 hover:bg-[#112A46] border border-[#34506D]/40 hover:border-[#7A8CA6] p-8 rounded-2xl transition text-right space-y-4 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[#0A1B2E] border border-[#34506D]/50 text-[#7A8CA6] group-hover:bg-[#34506D] group-hover:text-white transition flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="font-bold text-white text-base">امنیت بالا</h3>
            <p className="text-[#A1B2C4] text-xs sm:text-sm leading-relaxed">اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود.</p>
          </div>

          {/* کارت دوم */}
          <div className="bg-[#112A46]/70 hover:bg-[#112A46] border border-[#34506D]/40 hover:border-[#7A8CA6] p-8 rounded-2xl transition text-right space-y-4 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[#0A1B2E] border border-[#34506D]/50 text-[#7A8CA6] group-hover:bg-[#34506D] group-hover:text-white transition flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-bold text-white text-base">تقویم شمسی</h3>
            <p className="text-[#A1B2C4] text-xs sm:text-sm leading-relaxed">پشتیبانی کامل از تقویم شمسی و تعطیلات رسمی ایران.</p>
          </div>

          {/* کارت سوم */}
          <div className="bg-[#112A46]/70 hover:bg-[#112A46] border border-[#34506D]/40 hover:border-[#7A8CA6] p-8 rounded-2xl transition text-right space-y-4 shadow-lg group"><div className="w-12 h-12 rounded-xl bg-[#0A1B2E] border border-[#34506D]/50 text-[#7A8CA6] group-hover:bg-[#34506D] group-hover:text-white transition flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="font-bold text-white text-base">رزرو سریع</h3>
            <p className="text-[#A1B2C4] text-xs sm:text-sm leading-relaxed">در چند ثانیه نوبت خود را رزرو کنید.</p>
          </div>

          {/* کارت چهارم */}
          <div className="bg-[#112A46]/70 hover:bg-[#112A46] border border-[#34506D]/40 hover:border-[#7A8CA6] p-8 rounded-2xl transition text-right space-y-4 shadow-lg group">
            <div className="w-12 h-12 rounded-xl bg-[#0A1B2E] border border-[#34506D]/50 text-[#7A8CA6] group-hover:bg-[#34506D] group-hover:text-white transition flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="font-bold text-white text-base">دسترسی در همه‌جا</h3>
            <p className="text-[#A1B2C4] text-xs sm:text-sm leading-relaxed">مناسب برای موبایل، تبلت و دسکتاپ.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SpecialistUser {
  id?: string | number;
  full_name: string;
  headline?: string | null;
  slug: string;
  bio?: string | null;
}

const API_BASE_URL = "http://127.0.0.1:8001";

export default function SpecialistsSearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SpecialistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-extrabold text-indigo-600">
            SoloPortal
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              پنل کاربری
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              صفحه اصلی
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            جستجو و رزرو نوبت از متخصصان
          </h1>
          <p className="mt-3 text-base text-slate-600">
            نام مشاور، استاد، آموزشگاه یا شناسه اختصاصی را جستجو کنید و زمان جلسه خود را رزرو نمایید.
          </p>

          <div className="relative mt-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو بر اساس نام، تخصص یا اسلاگ..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                پاک کردن
              </button>
            )}
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                  <div className="mt-8 h-9 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-700">
                متخصصی با این مشخصات پیدا نشد
              </p>
              <p className="mt-1 text-sm text-slate-500">
                عبارت جستجو را تغییر دهید یا فیلتر را پاک کنید تا همه متخصصان نمایش داده شوند.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((specialist) => (
                <Link
                  key={specialist.slug}
                  href={`/book/${specialist.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                        {specialist.full_name ? specialist.full_name.charAt(0) : "S"}
                      </div>
                      <span
                        dir="ltr"
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        @{specialist.slug}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                      {specialist.full_name}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {specialist.headline ? specialist.headline : "مشاور و متخصص در SoloPortal"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-indigo-600">
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
    </div>
  );
}
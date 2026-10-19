
import { checkBackendHealth } from "@/lib/api";

export default async function TestApiPage() {
  try {
    const data = await checkBackendHealth();

    return (
      <main className="p-8" dir="rtl">
        <h1>اتصال به بک‌اند موفق بود ✅</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </main>
    );
  } catch {
    return (
      <main className="p-8" dir="rtl">
        <h1>اتصال به بک‌اند برقرار نشد ❌</h1>
      </main>
    );
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
const BASE_URL = `${API_URL}/api/v1`;

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("soloportal_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "خطایی در ارتباط با سرور رخ داد.";
    try {
      const errData = await response.json();
      if (response.status === 409) {
        errorDetail = "این بازه هم‌اکنون رزرو شده است.";
      } else if (typeof errData.detail === "string") {
        errorDetail = errData.detail;
      } else if (Array.isArray(errData.detail) && errData.detail[0]?.msg) {
        errorDetail = errData.detail[0].msg;
      }
    } catch {
      if (response.status === 409) {
        errorDetail = "این بازه هم‌اکنون رزرو شده است.";
      }
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
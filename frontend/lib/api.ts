
const API_URL = "http://127.0.0.1:8001";

export async function checkBackendHealth() {
  const response = await fetch(`${API_URL}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}

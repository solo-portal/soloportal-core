from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(title="Solo Portal API")

# اتصال روت‌های نسخه ۱ با پیشوند /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "project": "Solo Portal"}
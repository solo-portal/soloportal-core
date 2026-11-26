from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models
from app.api.v1.api import api_router

app = FastAPI(
    title="Solo Portal API",
    description="API سامانه جامع زمان‌بندی و رزرو آنلاین جلسات (SoloPortal)",
    version="1.0.0",
)

# تنظیمات CORS برای اتصال فرانت‌اند (Next.js) به بک‌اند
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# اتصال روت‌های نسخه ۱ با پیشوند /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "project": "Solo Portal"}
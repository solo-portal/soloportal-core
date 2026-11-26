import uuid
import pytest
from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.user import User


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture()
def two_users(client: TestClient):
    """ایجاد دو کاربر موقت (فریلنسر و مراجع) با توکن JWT واقعی و پاکسازی خودکار پس از پایان تست."""
    uid = uuid.uuid4().hex[:8]
    host_email = f"host_{uid}@example.com"
    host_slug = f"host-{uid}"
    client_email = f"client_{uid}@example.com"
    client_slug = f"client-{uid}"
    password = "TestPassword123!"

    r1 = client.post(
        "/api/v1/users",
        json={
            "email": host_email,
            "full_name": "دکتر تستی",
            "slug": host_slug,
            "headline": "مشاور نرم‌افزار",
            "password": password,
        },
    )
    assert r1.status_code == 201, r1.text
    host_data = r1.json()

    r2 = client.post(
        "/api/v1/users",
        json={
            "email": client_email,
            "full_name": "مراجع تستی",
            "slug": client_slug,
            "password": password,
        },
    )
    assert r2.status_code == 201, r2.text
    client_data = r2.json()

    tok1 = client.post(
        "/api/v1/auth/login", json={"email": host_email, "password": password}
    ).json()["access_token"]
    tok2 = client.post(
        "/api/v1/auth/login", json={"email": client_email, "password": password}
    ).json()["access_token"]

    host_headers = {"Authorization": f"Bearer {tok1}"}
    client_headers = {"Authorization": f"Bearer {tok2}"}

    yield {
        "host": host_data,
        "host_headers": host_headers,
        "client": client_data,
        "client_headers": client_headers,
        "password": password,
    }

    # پاکسازی کامل کاربران موقت از دیتابیس پس از تست
    db = SessionLocal()
    try:
        for email in (host_email, client_email):
            u = db.query(User).filter(User.email == email).first()
            if u:
                db.delete(u)
        db.commit()
    finally:
        db.close()

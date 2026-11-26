from datetime import datetime, timedelta, timezone


def test_booking_auth_conflict_and_soft_cancel_history(client, two_users):
    slug = two_users["host"]["slug"]
    host_h = two_users["host_headers"]
    client_h = two_users["client_headers"]

    srv = client.post(
        f"/api/v1/users/{slug}/services",
        json={"title": "مشاوره استراتژی", "duration_minutes": 45, "price": 800000},
        headers=host_h,
    ).json()
    srv_id = srv["id"]

    start = datetime.now(timezone.utc) + timedelta(days=7)
    slot = client.post(
        f"/api/v1/users/{slug}/slots",
        json={
            "service_id": srv_id,
            "start_time": start.isoformat(),
            "end_time": (start + timedelta(minutes=45)).isoformat(),
        },
        headers=host_h,
    ).json()
    slot_id = slot["id"]

    payload = {
        "slot_id": slot_id,
        "service_id": srv_id,
        "client_name": two_users["client"]["full_name"],
        "client_email": two_users["client"]["email"],
        "client_phone": "09123456789",
        "notes": "بررسی معماری پروژه",
    }

    # ۱. بدون احراز هویت -> رد می‌شود
    unauth = client.post("/api/v1/bookings", json=payload)
    assert unauth.status_code in (401, 403)

    # ۲. خود فریلنسر نمی‌تواند اسلات خودش را رزرو کند
    self_book = client.post("/api/v1/bookings", json=payload, headers=host_h)
    assert self_book.status_code == 409

    # ۳. رزرو موفق توسط مراجع احراز هویت شده
    b1 = client.post("/api/v1/bookings", json=payload, headers=client_h)
    assert b1.status_code == 201
    b1_id = b1.json()["id"]
    assert b1.json()["status"] == "CONFIRMED"

    # ۴. جلوگیری از رزرو دوگانه (409 Conflict)
    dup = client.post("/api/v1/bookings", json=payload, headers=client_h)
    assert dup.status_code == 409

    # ۵. بررسی آمار و لیست رزروهای دریافتی فریلنسر
    stats = client.get("/api/v1/bookings/host/stats", headers=host_h).json()
    assert stats["total_bookings"] == 1
    assert stats["total_revenue"] == 800000
    assert stats["active_clients"] == 1

    # ۶. لغو رزرو با حفظ تاریخچه (CANCELLED) و آزاد شدن اسلات
    cancel = client.delete(f"/api/v1/bookings/{b1_id}", headers=host_h)
    assert cancel.status_code == 200
    assert cancel.json()["status"] == "CANCELLED"

    # لغو مجدد همان رزرو -> 400
    double_cancel = client.delete(f"/api/v1/bookings/{b1_id}", headers=host_h)
    assert double_cancel.status_code == 400

    # ۷. رزرو مجدد همان اسلات آزادشده -> 201
    b2 = client.post("/api/v1/bookings", json=payload, headers=client_h)
    assert b2.status_code == 201
    b2_id = b2.json()["id"]

    # بررسی وجود هر دو رکورد CANCELLED و CONFIRMED در تاریخچه فریلنسر
    history = client.get("/api/v1/bookings/host", headers=host_h).json()
    statuses = {item["id"]: item["status"] for item in history}
    assert statuses.get(b1_id) == "CANCELLED"
    assert statuses.get(b2_id) == "CONFIRMED"

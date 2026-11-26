from datetime import datetime, timedelta, timezone


def test_service_crud_and_permissions(client, two_users):
    slug = two_users["host"]["slug"]
    host_h = two_users["host_headers"]
    client_h = two_users["client_headers"]

    # کاربر غیرمجاز نمی‌تواند برای فریلنسر سرویس بسازد
    forbidden = client.post(
        f"/api/v1/users/{slug}/services",
        json={"title": "غیرمجاز", "duration_minutes": 30, "price": 100000},
        headers=client_h,
    )
    assert forbidden.status_code == 403

    # ایجاد سرویس توسط خود فریلنسر
    created = client.post(
        f"/api/v1/users/{slug}/services",
        json={"title": "مشاوره بک‌اند", "duration_minutes": 45, "price": 500000},
        headers=host_h,
    )
    assert created.status_code == 201
    srv_id = created.json()["id"]

    # ویرایش سرویس
    updated = client.put(
        f"/api/v1/users/{slug}/services/{srv_id}",
        json={"price": 750000},
        headers=host_h,
    )
    assert updated.status_code == 200
    assert updated.json()["price"] == 750000

    # حذف سرویس
    deleted = client.delete(f"/api/v1/users/{slug}/services/{srv_id}", headers=host_h)
    assert deleted.status_code == 200


def test_slot_duration_match_and_overlap_validation(client, two_users):
    slug = two_users["host"]["slug"]
    host_h = two_users["host_headers"]

    srv = client.post(
        f"/api/v1/users/{slug}/services",
        json={"title": "جلسه ۳۰ دقیقه‌ای", "duration_minutes": 30, "price": 300000},
        headers=host_h,
    ).json()
    srv_id = srv["id"]

    base = datetime.now(timezone.utc) + timedelta(days=5)

    # مدت‌زمان ناهماهنگ با سرویس (۶۰ دقیقه برای سرویس ۳۰ دقیقه‌ای) -> 400
    mismatch = client.post(
        f"/api/v1/users/{slug}/slots",
        json={
            "service_id": srv_id,
            "start_time": base.isoformat(),
            "end_time": (base + timedelta(minutes=60)).isoformat(),
        },
        headers=host_h,
    )
    assert mismatch.status_code == 400

    # اسلات معتبر ۳۰ دقیقه‌ای -> 201
    valid = client.post(
        f"/api/v1/users/{slug}/slots",
        json={
            "service_id": srv_id,
            "start_time": base.isoformat(),
            "end_time": (base + timedelta(minutes=30)).isoformat(),
        },
        headers=host_h,
    )
    assert valid.status_code == 201
    slot_id = valid.json()["id"]

    # اسلات هم‌پوشان -> 400
    overlap = client.post(
        f"/api/v1/users/{slug}/slots",
        json={
            "service_id": srv_id,
            "start_time": (base + timedelta(minutes=15)).isoformat(),
            "end_time": (base + timedelta(minutes=45)).isoformat(),
        },
        headers=host_h,
    )
    assert overlap.status_code == 400

    # فیلتر بر اساس service_id
    listed = client.get(f"/api/v1/users/{slug}/slots?service_id={srv_id}")
    assert listed.status_code == 200
    assert any(s["id"] == slot_id for s in listed.json())

    # حذف اسلات آزاد
    del_slot = client.delete(f"/api/v1/users/{slug}/slots/{slot_id}", headers=host_h)
    assert del_slot.status_code == 200

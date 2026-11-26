def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_login_wrong_password_rejected(client, two_users):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": two_users["host"]["email"], "password": "WrongPassword!"},
    )
    assert res.status_code == 401


def test_me_requires_authentication(client, two_users):
    unauth = client.get("/api/v1/auth/me")
    assert unauth.status_code in (401, 403)

    auth = client.get("/api/v1/auth/me", headers=two_users["host_headers"])
    assert auth.status_code == 200
    assert auth.json()["slug"] == two_users["host"]["slug"]


def test_duplicate_email_and_slug_rejected(client, two_users):
    dup_email = client.post(
        "/api/v1/users",
        json={
            "email": two_users["host"]["email"],
            "full_name": "تکراری",
            "slug": "unique-slug-xyz-999",
            "password": "TestPassword123!",
        },
    )
    assert dup_email.status_code == 400

    dup_slug = client.post(
        "/api/v1/users",
        json={
            "email": "unique_email_xyz_999@example.com",
            "full_name": "تکراری",
            "slug": two_users["host"]["slug"],
            "password": "TestPassword123!",
        },
    )
    assert dup_slug.status_code == 400


def test_update_profile_and_duplicate_slug_guard(client, two_users):
    res = client.put(
        "/api/v1/users/me",
        json={"headline": "معمار ارشد سیستم‌های توزیع‌شده", "bio": "بیوگرافی جدید"},
        headers=two_users["host_headers"],
    )
    assert res.status_code == 200
    assert res.json()["headline"] == "معمار ارشد سیستم‌های توزیع‌شده"
    assert res.json()["bio"] == "بیوگرافی جدید"

    dup = client.put(
        "/api/v1/users/me",
        json={"slug": two_users["client"]["slug"]},
        headers=two_users["host_headers"],
    )
    assert dup.status_code == 400

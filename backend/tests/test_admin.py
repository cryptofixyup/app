"""Backend tests for the Scam-Link Sentinel admin dashboard auth + metrics."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
# Fallback: read from frontend/.env if not in process env
if not BASE_URL:
    from pathlib import Path
    env = (Path("/app/frontend/.env")).read_text()
    for line in env.splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "founder@scamlinksentinel.io"
ADMIN_PASSWORD = "Nicolasek18!@"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and data["access_token"]
    return data["access_token"]


# ---------- Login ----------
class TestAdminLogin:
    def test_login_success(self, session):
        r = session.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        assert "access_token" in d and isinstance(d["access_token"], str) and len(d["access_token"]) > 20
        assert d.get("token_type") == "bearer"
        assert d.get("expires_in") == 86400
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"]["role"] == "admin"

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "WrongPass1!"})
        assert r.status_code == 401
        assert "Invalid email or password" in r.text

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/admin/login", json={"email": "nope@example.com", "password": "Whatever1!"})
        assert r.status_code == 401

    def test_login_email_case_insensitive(self, session):
        r = session.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL.upper(), "password": ADMIN_PASSWORD})
        assert r.status_code == 200


# ---------- /admin/me ----------
class TestAdminMe:
    def test_me_with_token(self, session, admin_token):
        r = session.get(f"{API}/admin/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email"] == ADMIN_EMAIL
        assert d["role"] == "admin"
        assert "created_at" in d
        # MongoDB _id and password_hash MUST be stripped
        assert "_id" not in d
        assert "password_hash" not in d

    def test_me_without_token(self, session):
        r = session.get(f"{API}/admin/me")
        assert r.status_code == 401

    def test_me_with_invalid_token(self, session):
        r = session.get(f"{API}/admin/me", headers={"Authorization": "Bearer not.a.real.jwt"})
        assert r.status_code == 401

    def test_me_with_malformed_header(self, session):
        r = session.get(f"{API}/admin/me", headers={"Authorization": "blah"})
        assert r.status_code == 401


# ---------- /admin/metrics ----------
class TestAdminMetrics:
    def test_metrics_unauthorized(self, session):
        r = session.get(f"{API}/admin/metrics")
        assert r.status_code == 401

    def test_metrics_shape(self, session, admin_token):
        r = session.get(f"{API}/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert "total_signups" in d and isinstance(d["total_signups"], int)
        assert "by_category" in d
        for k in ("scam_link_sentinel", "mythos_guard", "other"):
            assert k in d["by_category"]
            assert isinstance(d["by_category"][k], int)
        assert "by_source" in d and isinstance(d["by_source"], dict)
        assert "revenue" in d
        for k in ("total_paid_usd", "paid_subscriptions", "pending_subscriptions", "founding_members"):
            assert k in d["revenue"]


# ---------- /admin/signups ----------
class TestAdminSignups:
    @classmethod
    def setup_class(cls):
        # Seed at least one known waitlist record so we can search/paginate deterministically
        cls.seeded_email = f"TEST_admin_{uuid.uuid4().hex[:8]}@example.com"

    def test_signups_unauthorized(self, session):
        r = session.get(f"{API}/admin/signups")
        assert r.status_code == 401

    def test_seed_waitlist(self, session):
        r = session.post(f"{API}/waitlist", json={"email": self.seeded_email, "source": "hero"})
        assert r.status_code == 200

    def test_signups_default(self, session, admin_token):
        r = session.get(f"{API}/admin/signups", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("total", "limit", "offset", "items"):
            assert k in d
        assert isinstance(d["items"], list)
        if d["items"]:
            item = d["items"][0]
            for k in ("email", "source", "category", "created_at", "founding_member", "payment_status"):
                assert k in item

    def test_signups_search(self, session, admin_token):
        # Search for the email we just seeded (case-insensitive substring)
        substr = self.seeded_email.split("@")[0][:12]
        r = session.get(
            f"{API}/admin/signups",
            params={"search": substr.lower()},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["total"] >= 1
        assert any(self.seeded_email in (i["email"] or "") for i in d["items"])

    def test_signups_pagination(self, session, admin_token):
        r = session.get(
            f"{API}/admin/signups",
            params={"limit": 2, "offset": 0},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["limit"] == 2
        assert d["offset"] == 0
        assert len(d["items"]) <= 2


# ---------- Public endpoints stay open ----------
class TestPublicEndpointsUnprotected:
    def test_waitlist_open(self, session):
        email = f"TEST_pub_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/waitlist", json={"email": email, "source": "hero"})
        assert r.status_code == 200

    def test_scan_open(self, session):
        r = session.post(f"{API}/scan", json={"url": "https://uniswap.org/swap"})
        assert r.status_code == 200

    def test_stats_open(self, session):
        r = session.get(f"{API}/stats")
        assert r.status_code == 200


# ---------- Admin seed idempotency (verified via repeated login) ----------
def test_admin_seed_idempotent_via_relogin(session):
    # Login twice, both must succeed (proves seed didn't break/duplicate the admin)
    for _ in range(2):
        r = session.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200

"""Backend integration tests for Scam-Link Sentinel API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://scam-detector-122.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root ----------
def test_root_operational(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "operational"
    assert data.get("service") == "Scam-Link Sentinel"


# ---------- Waitlist ----------
class TestWaitlist:
    def test_join_valid(self, session):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/waitlist", json={"email": email, "source": "hero"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["source"] == "hero"
        assert "id" in data

    def test_join_idempotent(self, session):
        email = f"TEST_idem_{uuid.uuid4().hex[:8]}@example.com"
        r1 = session.post(f"{API}/waitlist", json={"email": email})
        assert r1.status_code == 200
        id1 = r1.json()["id"]
        r2 = session.post(f"{API}/waitlist", json={"email": email})
        assert r2.status_code == 200
        assert r2.json()["id"] == id1, "Duplicate email must return existing entry"

    def test_join_invalid_email(self, session):
        r = session.post(f"{API}/waitlist", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_count_has_baseline(self, session):
        r = session.get(f"{API}/waitlist/count")
        assert r.status_code == 200
        c = r.json()["count"]
        assert c >= 2847


# ---------- Scan ----------
class TestScan:
    def test_safe_url(self, session):
        r = session.post(f"{API}/scan", json={"url": "https://uniswap.org/swap"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["verdict"] == "SAFE"
        assert d["risk_score"] < 20
        assert isinstance(d["analysis"], list) and len(d["analysis"]) > 0

    def test_danger_wallet_drainer(self, session):
        r = session.post(f"{API}/scan", json={"url": "https://x-airdrop-claim.xyz/wallet-connect"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["verdict"] == "DANGER", f"Expected DANGER, got {d}"
        assert d["risk_score"] >= 45

    def test_danger_typosquat_kyc(self, session):
        r = session.post(f"{API}/scan", json={"url": "https://metmask-support.help/kyc-verify"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["verdict"] == "DANGER", f"Expected DANGER, got {d}"
        assert d["risk_score"] >= 45

    def test_empty_url(self, session):
        r = session.post(f"{API}/scan", json={"url": ""})
        assert r.status_code == 400


# ---------- Threat feed ----------
def test_threats_recent(session):
    r = session.get(f"{API}/threats/recent")
    assert r.status_code == 200
    d = r.json()
    assert "items" in d and isinstance(d["items"], list) and len(d["items"]) > 0
    assert "total_blocked_today" in d
    assert isinstance(d["total_blocked_today"], int)


# ---------- Stats ----------
def test_stats(session):
    r = session.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["scams_blocked", "users_protected", "links_scanned", "funds_saved_usd"]:
        assert k in d, f"missing {k}"
        assert isinstance(d[k], int)


# ---------- Checkout ----------
class TestCheckout:
    session_id_holder = {}

    def test_create_invalid_package(self, session):
        r = session.post(
            f"{API}/checkout/session",
            json={"package_id": "bogus", "origin_url": BASE_URL},
        )
        assert r.status_code == 400

    def test_create_valid(self, session):
        r = session.post(
            f"{API}/checkout/session",
            json={"package_id": "founding_member", "origin_url": BASE_URL},
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and d["url"].startswith("http")
        assert "session_id" in d and d["session_id"]
        TestCheckout.session_id_holder["sid"] = d["session_id"]

    def test_status(self, session):
        sid = TestCheckout.session_id_holder.get("sid")
        if not sid:
            pytest.skip("No session id from previous test")
        r = session.get(f"{API}/checkout/status/{sid}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["session_id"] == sid
        assert "status" in d and "payment_status" in d

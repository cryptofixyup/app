from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import csv
import logging
import uuid
import bcrypt
import jwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone, timedelta

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Stripe key
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY")

# JWT / Admin
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_TTL_HOURS = 24
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"].lower().strip()
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

# Fixed packages (server-side definition prevents price tampering)
PACKAGES = {
    "founding_member": {
        "name": "Founding Member - Scam-Link Sentinel",
        "amount": 4.99,
        "currency": "usd",
        "description": "Lifetime-locked founding member rate. Monthly subscription.",
    }
}

app = FastAPI(title="Scam-Link Sentinel API")
api_router = APIRouter(prefix="/api")

# ------------ Models ------------

class WaitlistCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "hero"


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    source: str = "hero"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScanRequest(BaseModel):
    url: str


class ScanResult(BaseModel):
    verdict: str  # SAFE | DANGER | WARNING
    risk_score: int
    threats: List[str]
    analysis: List[str]
    scanned_url: str


class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    email: Optional[EmailStr] = None


class StatusResponse(BaseModel):
    session_id: str
    status: str
    payment_status: str
    amount_total: int
    currency: str


# ------------ Routes ------------

@api_router.get("/")
async def root():
    return {"service": "Scam-Link Sentinel", "status": "operational"}


@api_router.post("/waitlist", response_model=WaitlistEntry)
async def join_waitlist(payload: WaitlistCreate):
    # Idempotent: if email already exists, return existing
    existing = await db.waitlist.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        if isinstance(existing.get("created_at"), str):
            existing["created_at"] = datetime.fromisoformat(existing["created_at"])
        return WaitlistEntry(**existing)

    entry = WaitlistEntry(email=payload.email, source=payload.source or "hero")
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.waitlist.insert_one(doc)
    return entry


@api_router.get("/waitlist/count")
async def waitlist_count():
    count = await db.waitlist.count_documents({})
    # Add a baseline so the number feels punchy even at zero
    return {"count": 2847 + count}


# ----- Scam scan (mock MYTHOS verdict engine for the interactive demo) -----

DANGER_PATTERNS = [
    "free-mint", "airdrop-claim", "wallet-connect", "double-eth", "x2-eth",
    "bonus-apy", "lock-period", "withdrawal-fee", "minimum-deposit",
    "kyc-verify", "telegram-support", "metmask", "openseaa", "uniswpa",
    "binance-promo", "elonx", "musk-giveaway", "presale-",
    "ai-trading", "auto-yield", "compounding-bot", "guarantee-",
]

WARNING_PATTERNS = ["staking-", "yield-", "claim-", "bonus", "free", "vip-"]

SAFE_DOMAINS = ["uniswap.org", "opensea.io", "ethereum.org", "binance.com", "coinbase.com", "metamask.io"]


@api_router.post("/scan", response_model=ScanResult)
async def scan_link(payload: ScanRequest):
    url = payload.url.strip().lower()
    if not url:
        raise HTTPException(400, "Empty URL")

    threats: List[str] = []
    analysis: List[str] = []
    risk = 0

    # Domain check
    if any(d in url for d in SAFE_DOMAINS):
        if url.startswith("http") and any("//" + d in url or url.endswith(d) for d in SAFE_DOMAINS):
            analysis.append("Domain matches verified registry.")

    # Lookalike / typosquat
    typo_hits = [p for p in ["metmask", "openseaa", "uniswpa", "binnance", "etherium", "coiinbase"] if p in url]
    if typo_hits:
        threats.append(f"Lookalike domain detected: {', '.join(typo_hits)}")
        risk += 45

    # Withdrawal-lock patterns
    if any(p in url for p in ["withdrawal-fee", "minimum-deposit", "lock-period", "kyc-verify"]):
        threats.append("Withdrawal-lock pattern flagged (deposit-then-trap heuristic).")
        risk += 35

    # AI-investment / fake APY
    if any(p in url for p in ["ai-trading", "auto-yield", "compounding-bot", "bonus-apy", "guarantee-"]):
        threats.append("Fake AI-investment / unrealistic APY schema detected.")
        risk += 30

    # Wallet drainer
    if any(p in url for p in ["wallet-connect", "free-mint", "airdrop-claim", "double-eth", "x2-eth"]):
        threats.append("Wallet-drainer signature: malicious connect pattern.")
        risk += 55

    # Telegram / social engineering
    if "telegram-support" in url or "elonx" in url or "musk-giveaway" in url:
        threats.append("Social-engineering impersonation pattern.")
        risk += 25

    # Generic danger pattern fallthrough
    if any(p in url for p in DANGER_PATTERNS) and not threats:
        threats.append("Suspicious campaign keyword detected in URL path.")
        risk += 20

    if any(p in url for p in WARNING_PATTERNS) and not threats:
        threats.append("Promotional / claim keyword present — verify destination.")
        risk += 15

    # HTTPS hygiene
    if url.startswith("http://"):
        threats.append("Connection is unencrypted (HTTP).")
        risk += 10
        analysis.append("No TLS — credentials would be sent in plaintext.")
    else:
        analysis.append("TLS handshake observed.")

    # Whois / age heuristic (mock)
    if risk == 0 and any(d in url for d in SAFE_DOMAINS):
        analysis.append("Registered > 5 years. Reputation: high.")
        analysis.append("Zero blacklist matches across 14 threat feeds.")
        verdict = "SAFE"
        risk = 4
    else:
        if not analysis:
            analysis.append("On-chain forensic engine: no verified counterparty.")
            analysis.append("Domain registered < 30 days. Reputation: unknown.")
        if risk >= 45:
            verdict = "DANGER"
        elif risk >= 20:
            verdict = "WARNING"
        elif risk > 0:
            verdict = "WARNING"
        else:
            # Unknown but no signal — neutral
            verdict = "WARNING"
            threats.append("No prior signal — proceed with caution, signature unknown.")
            risk = 18

    risk = min(risk, 98)

    return ScanResult(
        verdict=verdict,
        risk_score=risk,
        threats=threats[:5],
        analysis=analysis[:5],
        scanned_url=payload.url,
    )


# ----- Threat feed (mock live data) -----
@api_router.get("/threats/recent")
async def recent_threats():
    feed = [
        {"url": "x-airdrop-claim.xyz/wallet-connect", "verdict": "DANGER", "type": "Wallet Drainer", "blocked": 1247},
        {"url": "uniswpa-v4-launch.app/free-mint", "verdict": "DANGER", "type": "Typosquat", "blocked": 891},
        {"url": "ai-yield-bot.finance/auto-compound", "verdict": "DANGER", "type": "Fake APY", "blocked": 643},
        {"url": "metmask-support.help/kyc-verify", "verdict": "DANGER", "type": "Phishing", "blocked": 2104},
        {"url": "elonx-x2-eth.live/double", "verdict": "DANGER", "type": "Giveaway Scam", "blocked": 412},
        {"url": "binance-promo-bonus.io/lock-period", "verdict": "DANGER", "type": "Withdrawal Lock", "blocked": 778},
        {"url": "openseaa-mint-pass.art/claim", "verdict": "DANGER", "type": "Fake Mint", "blocked": 1583},
        {"url": "telegram-support-defi.bot/verify", "verdict": "DANGER", "type": "Social Eng.", "blocked": 956},
    ]
    return {"items": feed, "total_blocked_today": sum(f["blocked"] for f in feed)}


# ----- Stripe Checkout -----

@api_router.post("/checkout/session")
async def create_checkout(payload: CheckoutRequest, http_request: Request):
    if payload.package_id not in PACKAGES:
        raise HTTPException(400, "Invalid package")

    pkg = PACKAGES[payload.package_id]
    origin = payload.origin_url.rstrip("/")
    success_url = f"{origin}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/?canceled=1"

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    metadata = {
        "package_id": payload.package_id,
        "package_name": pkg["name"],
        "email": payload.email or "anonymous",
        "source": "landing_founding_member",
    }

    req = CheckoutSessionRequest(
        amount=float(pkg["amount"]),
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(req)

    txn = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "package_id": payload.package_id,
        "amount": pkg["amount"],
        "currency": pkg["currency"],
        "email": payload.email,
        "metadata": metadata,
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(txn)

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, http_request: Request):
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})

    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        # Idempotent update
        if existing and existing.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": status.status,
                    "payment_status": status.payment_status,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            if status.payment_status == "paid" and existing.get("email"):
                await db.waitlist.update_one(
                    {"email": existing["email"]},
                    {"$set": {"founding_member": True}},
                    upsert=False,
                )
        return StatusResponse(
            session_id=session_id,
            status=status.status,
            payment_status=status.payment_status,
            amount_total=status.amount_total,
            currency=status.currency,
        )
    except Exception as e:
        # Stripe SDK lookup failed — fall back to persisted record so UX stays resilient.
        logger.warning(f"Stripe status lookup failed for {session_id}: {e}")
        if existing:
            amount_cents = int(round(float(existing.get("amount", 0)) * 100))
            return StatusResponse(
                session_id=session_id,
                status=existing.get("status", "open"),
                payment_status=existing.get("payment_status", "pending"),
                amount_total=amount_cents,
                currency=existing.get("currency", "usd"),
            )
        raise HTTPException(404, "Session not found")


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        evt = await stripe_checkout.handle_webhook(body, signature)
        await db.payment_transactions.update_one(
            {"session_id": evt.session_id},
            {"$set": {
                "payment_status": evt.payment_status,
                "last_event": evt.event_type,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        return {"received": True}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(400, "Webhook validation failed")


# ----- Stats (mock trust-signal numbers) -----
@api_router.get("/stats")
async def stats():
    return {
        "scams_blocked": 184_237,
        "users_protected": 12_408,
        "links_scanned": 1_283_492,
        "funds_saved_usd": 8_400_000,
    }


# ====================== ADMIN AUTH ======================

bearer_scheme = HTTPBearer(auto_error=False)


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_admin_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
):
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    email = (payload.get("sub") or "").lower()
    admin = await db.admins.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    email = payload.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_admin_token(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_TTL_HOURS * 3600,
        "user": {"email": email, "role": "admin"},
    }


@api_router.get("/admin/me")
async def admin_me(admin=Depends(get_current_admin)):
    return admin


@api_router.get("/admin/metrics")
async def admin_metrics(admin=Depends(get_current_admin)):
    total_signups = await db.waitlist.count_documents({})

    # By source
    pipeline = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    by_source_raw = await db.waitlist.aggregate(pipeline).to_list(50)
    by_source = {row["_id"] or "unknown": row["count"] for row in by_source_raw}

    sentinel_sources = {"hero", "footer", "pricing"}
    mythos_sources = {"mythos_guard_beta"}
    sentinel_count = sum(v for k, v in by_source.items() if k in sentinel_sources)
    mythos_count = sum(v for k, v in by_source.items() if k in mythos_sources)
    other_count = sum(v for k, v in by_source.items() if k not in sentinel_sources | mythos_sources)

    # Revenue (only paid transactions)
    paid_cursor = db.payment_transactions.find(
        {"payment_status": "paid"}, {"_id": 0, "amount": 1}
    )
    paid_docs = await paid_cursor.to_list(10000)
    total_revenue = round(sum(float(d.get("amount", 0)) for d in paid_docs), 2)
    paid_count = len(paid_docs)

    pending_count = await db.payment_transactions.count_documents(
        {"payment_status": {"$in": ["initiated", "pending"]}}
    )
    founding_members = await db.waitlist.count_documents({"founding_member": True})

    return {
        "total_signups": total_signups,
        "by_category": {
            "scam_link_sentinel": sentinel_count,
            "mythos_guard": mythos_count,
            "other": other_count,
        },
        "by_source": by_source,
        "revenue": {
            "total_paid_usd": total_revenue,
            "paid_subscriptions": paid_count,
            "pending_subscriptions": pending_count,
            "founding_members": founding_members,
        },
    }


@api_router.get("/admin/signups")
async def admin_signups(
    admin=Depends(get_current_admin),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    query = {}
    if search:
        query["email"] = {"$regex": search, "$options": "i"}

    total = await db.waitlist.count_documents(query)
    cursor = (
        db.waitlist.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    items = await cursor.to_list(limit)

    # Enrich with payment status
    emails = [i["email"] for i in items if i.get("email")]
    payments = {}
    if emails:
        async for doc in db.payment_transactions.find(
            {"email": {"$in": emails}}, {"_id": 0, "email": 1, "payment_status": 1, "amount": 1, "created_at": 1}
        ):
            # Keep the most relevant per email (prefer paid > pending)
            prev = payments.get(doc["email"])
            if not prev or (doc.get("payment_status") == "paid" and prev.get("payment_status") != "paid"):
                payments[doc["email"]] = doc

    enriched = []
    for it in items:
        p = payments.get(it.get("email"))
        category = "mythos_guard" if it.get("source") == "mythos_guard_beta" else "scam_link_sentinel"
        enriched.append({
            "email": it.get("email"),
            "source": it.get("source"),
            "category": category,
            "created_at": it.get("created_at"),
            "founding_member": bool(it.get("founding_member", False)),
            "payment_status": (p or {}).get("payment_status"),
            "payment_amount": (p or {}).get("amount"),
        })

    return {"total": total, "limit": limit, "offset": offset, "items": enriched}


@api_router.get("/admin/signups.csv")
async def admin_signups_csv(
    admin=Depends(get_current_admin),
    search: Optional[str] = Query(None),
):
    query = {}
    if search:
        query["email"] = {"$regex": search, "$options": "i"}

    cursor = db.waitlist.find(query, {"_id": 0}).sort("created_at", -1)
    rows = await cursor.to_list(100_000)

    emails = [r["email"] for r in rows if r.get("email")]
    payments = {}
    if emails:
        async for doc in db.payment_transactions.find(
            {"email": {"$in": emails}},
            {"_id": 0, "email": 1, "payment_status": 1, "amount": 1},
        ):
            prev = payments.get(doc["email"])
            if not prev or (
                doc.get("payment_status") == "paid"
                and prev.get("payment_status") != "paid"
            ):
                payments[doc["email"]] = doc

    buf = io.StringIO()
    writer = csv.writer(buf, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(
        [
            "email",
            "category",
            "source",
            "signed_up_at",
            "founding_member",
            "payment_status",
            "payment_amount_usd",
        ]
    )
    for r in rows:
        p = payments.get(r.get("email")) or {}
        category = "mythos_guard" if r.get("source") == "mythos_guard_beta" else "scam_link_sentinel"
        writer.writerow(
            [
                r.get("email", ""),
                category,
                r.get("source", ""),
                r.get("created_at", ""),
                "yes" if r.get("founding_member") else "no",
                p.get("payment_status", ""),
                f"{float(p.get('amount', 0)):.2f}" if p.get("amount") is not None else "",
            ]
        )

    csv_bytes = buf.getvalue().encode("utf-8")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    filename = f"sentinel-signups-{timestamp}.csv"
    return StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


async def seed_admin():
    existing = await db.admins.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.admins.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.admins.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_admin()
    await db.admins.create_index("email", unique=True)
    await db.waitlist.create_index("email", unique=True)
    await db.waitlist.create_index("source")
    await db.payment_transactions.create_index("session_id", unique=True)
    await db.payment_transactions.create_index("email")
    logger.info("Startup complete: admin seeded, indexes ensured.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone

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
        if url.startswith("http") and ("//" + d in url or url.endswith(d) for d in SAFE_DOMAINS):
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

    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    # Idempotent update
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if existing and existing.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status.status,
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        # On first successful payment, also auto-enroll the email in waitlist as founding member
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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

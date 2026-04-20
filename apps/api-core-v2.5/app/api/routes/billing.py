"""Billing routes — Forge credit packs + subscription plans via Stripe Checkout.

POST /billing/checkout              → create Stripe Checkout session for credit pack
POST /billing/subscription-checkout → create Stripe Checkout session for subscription plan
POST /billing/webhook               → Stripe webhook; handles payment + subscription events
GET  /billing/status                → return user's credit balance + subscription info
"""

import logging
import os
from datetime import datetime, timezone
from typing import Literal

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.db.models import User
from app.db.models.billing import CreditPurchase
from app.services.crm_sync_orchestrator import on_subscription_changed

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["Billing"])

# ---------------------------------------------------------------------------
# Credit packs
# ---------------------------------------------------------------------------
CREDIT_PACKS = {
    "starter": {"credits": 10, "amount_brl": "9.00", "amount_cents": 900, "label": "10 créditos"},
    "pro": {"credits": 50, "amount_brl": "39.00", "amount_cents": 3900, "label": "50 créditos"},
}

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    pack: Literal["starter", "pro"] = "starter"
    success_url: str = f"{settings.frontend_url}/settings/billing?status=success"
    cancel_url: str = f"{settings.frontend_url}/settings/billing?status=cancelled"


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    credits: int
    amount_brl: str


class BillingStatusResponse(BaseModel):
    forge_credits: int
    is_premium: bool = False
    subscription_plan: str = "free"
    subscription_status: str = "inactive"


# ---------------------------------------------------------------------------
# Subscription plans
# ---------------------------------------------------------------------------
SUBSCRIPTION_PLANS = {
    "pro": {
        "label": "Navegador",
        "price_brl": "79.00",
        "stripe_price_id_env": "STRIPE_PRICE_PRO",  # env var name
    },
    "premium": {
        "label": "Comandante",
        "price_brl": "149.00",
        "stripe_price_id_env": "STRIPE_PRICE_PREMIUM",  # env var name
    },
}


class SubscriptionCheckoutRequest(BaseModel):
    plan: Literal["pro", "premium"]
    success_url: str = f"{settings.frontend_url}/subscription/manage?status=success"
    cancel_url: str = f"{settings.frontend_url}/subscription?status=cancelled"


class SubscriptionCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    plan: str
    price_brl: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/status", response_model=BillingStatusResponse)
async def billing_status(
    current_user: User = Depends(get_current_user),
):
    """Return the current user's credit balance and subscription info."""
    return BillingStatusResponse(
        forge_credits=current_user.forge_credits,
        is_premium=current_user.is_premium,
        subscription_plan=current_user.subscription_plan,
        subscription_status=current_user.subscription_status,
    )


@router.post("/cancel-subscription", response_model=dict)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel the current user's active Stripe subscription at period end."""
    if not current_user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found.")

    stripe.api_key = settings.stripe_secret_key

    try:
        subscription = stripe.Subscription.modify(
            current_user.stripe_subscription_id,
            cancel_at_period_end=True,
        )
        
        current_user.subscription_status = subscription.status
        if subscription.cancel_at:
            current_user.subscription_cancel_at = datetime.fromtimestamp(
                subscription.cancel_at, tz=timezone.utc
            )
            
        await db.commit()
        
        return {
            "message": "Subscription set to cancel at the end of the current period.",
            "cancel_at": current_user.subscription_cancel_at.isoformat() if current_user.subscription_cancel_at else None
        }
    except stripe.error.StripeError as e:
        logger.error("Stripe subscription cancellation failed: %s", e)
        raise HTTPException(status_code=502, detail="Payment provider error.")


@router.get("/invoices", response_model=list)
async def list_invoices(
    current_user: User = Depends(get_current_user),
):
    """List the current user's recent Stripe invoices."""
    if not current_user.stripe_customer_id:
        return []

    stripe.api_key = settings.stripe_secret_key

    try:
        invoices = stripe.Invoice.list(
            customer=current_user.stripe_customer_id,
            limit=12
        )
        
        return [
            {
                "id": inv.id,
                "amount_paid": inv.amount_paid / 100,
                "currency": inv.currency,
                "status": inv.status,
                "date": datetime.fromtimestamp(inv.created, tz=timezone.utc).isoformat(),
                "pdf_url": inv.invoice_pdf,
                "number": inv.number
            }
            for inv in invoices.data
        ]
    except stripe.error.StripeError as e:
        logger.error("Stripe invoice listing failed: %s", e)
        return []


@router.post("/subscription-checkout", response_model=SubscriptionCheckoutResponse)
async def create_subscription_checkout(
    request: SubscriptionCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Checkout session for a subscription plan.

    Requires STRIPE_PRICE_PRO or STRIPE_PRICE_PREMIUM env vars to be set with
    the Stripe Price ID for each plan. Returns a checkout_url to redirect the user.
    On success Stripe calls /billing/webhook which activates the subscription.
    """
    plan_config = SUBSCRIPTION_PLANS.get(request.plan)
    if not plan_config:
        raise HTTPException(status_code=400, detail="Invalid subscription plan.")

    price_id = os.environ.get(plan_config["stripe_price_id_env"])
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Subscription checkout is not configured yet. "
                   f"Set {plan_config['stripe_price_id_env']} environment variable.",
        )

    stripe.api_key = settings.stripe_secret_key

    # Create or reuse Stripe customer
    customer_id = current_user.stripe_customer_id
    try:
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.full_name or current_user.email,
                metadata={"user_id": str(current_user.id)},
            )
            customer_id = customer.id
            current_user.stripe_customer_id = customer_id
            await db.commit()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "plan": request.plan,
            },
        )
    except stripe.error.StripeError as e:
        logger.error("Stripe subscription checkout creation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment provider error. Try again shortly.",
        )

    return SubscriptionCheckoutResponse(
        checkout_url=session.url,
        session_id=session.id,
        plan=request.plan,
        price_brl=plan_config["price_brl"],
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Checkout session for a credit pack purchase.

    Returns a URL to redirect the user to. On success Stripe calls /billing/webhook
    which credits the user's account automatically.
    """
    pack = CREDIT_PACKS.get(request.pack)
    if not pack:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credit pack.")

    stripe.api_key = settings.stripe_secret_key

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "brl",
                    "unit_amount": pack["amount_cents"],
                    "product_data": {
                        "name": f"Olcan Forge — {pack['label']}",
                        "description": f"Créditos para usar a IA do Narrative Forge",
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={
                "user_id": str(current_user.id),
                "pack": request.pack,
                "credits": str(pack["credits"]),
            },
        )
    except stripe.error.StripeError as e:
        logger.error("Stripe checkout creation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment provider error. Try again shortly.",
        )

    # Persist pending purchase record
    purchase = CreditPurchase(
        user_id=current_user.id,
        stripe_session_id=session.id,
        credits_purchased=pack["credits"],
        amount_brl=pack["amount_brl"],
        status="pending",
    )
    db.add(purchase)
    await db.commit()

    return CheckoutResponse(
        checkout_url=session.url,
        session_id=session.id,
        credits=pack["credits"],
        amount_brl=pack["amount_brl"],
    )


@router.post("/webhook", status_code=200)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Stripe webhook endpoint.

    Listens for checkout.session.completed events and credits the user's
    forge_credits balance. Must be registered in the Stripe dashboard.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload.")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature.")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session["id"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id")
        mode = session.get("mode", "payment")

        if not user_id:
            logger.warning("Webhook: checkout.session.completed missing user_id in metadata")
            return {"received": True}

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if mode == "payment":
            # Credit pack purchase
            credits_str = metadata.get("credits", "0")
            credits_to_add = int(credits_str)

            result2 = await db.execute(
                select(CreditPurchase).where(CreditPurchase.stripe_session_id == session_id)
            )
            purchase = result2.scalar_one_or_none()
            if purchase and purchase.status == "pending":
                purchase.status = "paid"
                purchase.paid_at = datetime.now(timezone.utc)

            if user:
                user.forge_credits += credits_to_add
                logger.info("Credited %d Forge credits to user %s", credits_to_add, user_id)
            else:
                logger.error("Webhook: user %s not found", user_id)

        elif mode == "subscription":
            # Subscription activated
            plan = metadata.get("plan", "pro")
            subscription_id = session.get("subscription")
            if user:
                user.subscription_plan = plan
                user.is_premium = True
                user.stripe_subscription_id = subscription_id
                user.subscription_status = "active"
                logger.info("Activated %s subscription for user %s", plan, user_id)

        _subscription_plan_activated = metadata.get("plan") if (mode == "subscription" and user) else None

        await db.commit()

        if _subscription_plan_activated and user:
            await on_subscription_changed(db, user, _subscription_plan_activated, action="upgraded")

    elif event["type"] in ("customer.subscription.deleted", "customer.subscription.updated"):
        sub = event["data"]["object"]
        sub_status = sub.get("status")
        customer_id = sub.get("customer")
        cancel_at_period_end = sub.get("cancel_at_period_end", False)
        cancel_at = sub.get("cancel_at")

        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            is_active = sub_status in ("active", "trialing")
            user.subscription_status = sub_status or "unknown"
            user.is_premium = is_active

            # Handle cancellation at period end (user cancelled but still has time)
            if cancel_at_period_end and cancel_at:
                user.subscription_cancel_at = datetime.fromtimestamp(cancel_at, tz=timezone.utc)
            elif not cancel_at_period_end:
                user.subscription_cancel_at = None

            if not is_active and sub_status != "past_due":
                user.subscription_plan = "free"
                user.subscription_cancel_at = None

            logger.info("Subscription %s for customer %s → status=%s", sub["id"], customer_id, sub_status)
            await db.commit()

        if user:
            action = "cancelled" if not is_active else "updated"
            await on_subscription_changed(db, user, user.subscription_plan, action=action)

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        customer_id = invoice.get("customer")
        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.subscription_status = "past_due"
            # Keep is_premium=True for grace period — Stripe will send
            # customer.subscription.deleted if retries exhaust
            logger.warning("Invoice payment failed for customer %s — set past_due", customer_id)
            await db.commit()

    elif event["type"] == "invoice.paid":
        invoice = event["data"]["object"]
        customer_id = invoice.get("customer")
        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user and user.subscription_status == "past_due":
            user.subscription_status = "active"
            logger.info("Invoice paid — restored active status for customer %s", customer_id)
            await db.commit()

    return {"received": True}

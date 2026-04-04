"""
Payment Service

Handles payment processing, Stripe integration, and order payment management.
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import stripe
import os

from ..models.ecommerce import Order, OrderStatus
from ..core.config import settings


class PaymentService:
    """Service for payment processing"""
    
    def __init__(self, db: Session):
        self.db = db
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY', settings.stripe_secret_key)
    
    async def create_payment_intent(
        self,
        order_id: str,
        amount: float,
        currency: str = "USD",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create Stripe PaymentIntent for order
        
        Args:
            order_id: Order ID
            amount: Amount in dollars
            currency: Currency code
            metadata: Additional metadata
            
        Returns:
            PaymentIntent details
        """
        
        # Convert amount to cents
        amount_cents = int(amount * 100)
        
        # Create PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency.lower(),
            metadata={
                'order_id': order_id,
                **(metadata or {})
            },
            automatic_payment_methods={
                'enabled': True,
            }
        )
        
        return {
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
            'amount': amount,
            'currency': currency,
            'status': intent.status
        }
    
    async def confirm_payment(
        self,
        payment_intent_id: str,
        order_id: str
    ) -> bool:
        """
        Confirm payment and update order status
        
        Args:
            payment_intent_id: Stripe PaymentIntent ID
            order_id: Order ID
            
        Returns:
            Success status
        """
        
        try:
            # Retrieve PaymentIntent
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                # Update order
                order = self.db.query(Order).filter(Order.id == order_id).first()
                
                if order:
                    order.payment_intent_id = payment_intent_id
                    order.payment_status = 'paid'
                    order.paid_at = datetime.utcnow()
                    order.status = OrderStatus.PAID
                    
                    self.db.commit()
                    
                    return True
            
            return False
            
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            return False
    
    async def process_refund(
        self,
        order_id: str,
        amount: Optional[float] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """
        Process refund for order
        
        Args:
            order_id: Order ID
            amount: Refund amount (None for full refund)
            reason: Refund reason
            
        Returns:
            Refund details
        """
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        
        if not order or not order.payment_intent_id:
            raise ValueError("Order not found or no payment to refund")
        
        # Calculate refund amount
        refund_amount_cents = int((amount or order.total) * 100)
        
        # Create refund
        refund = stripe.Refund.create(
            payment_intent=order.payment_intent_id,
            amount=refund_amount_cents,
            reason=reason
        )
        
        # Update order
        order.status = OrderStatus.REFUNDED
        order.payment_status = 'refunded'
        
        self.db.commit()
        
        return {
            'refund_id': refund.id,
            'amount': refund.amount / 100,
            'currency': refund.currency,
            'status': refund.status
        }
    
    async def handle_webhook(
        self,
        payload: bytes,
        signature: str
    ) -> Dict[str, Any]:
        """
        Handle Stripe webhook events
        
        Args:
            payload: Webhook payload
            signature: Stripe signature header
            
        Returns:
            Event processing result
        """
        
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', settings.stripe_webhook_secret)
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")
        
        # Handle event types
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            order_id = payment_intent.metadata.get('order_id')
            
            if order_id:
                await self.confirm_payment(payment_intent.id, order_id)
        
        elif event.type == 'payment_intent.payment_failed':
            payment_intent = event.data.object
            order_id = payment_intent.metadata.get('order_id')
            
            if order_id:
                order = self.db.query(Order).filter(Order.id == order_id).first()
                if order:
                    order.payment_status = 'failed'
                    order.status = OrderStatus.CANCELLED
                    self.db.commit()
        
        elif event.type == 'charge.refunded':
            charge = event.data.object
            # Handle refund
            pass
        
        return {
            'event_type': event.type,
            'processed': True
        }
    
    async def create_checkout_session(
        self,
        order_id: str,
        success_url: str,
        cancel_url: str
    ) -> Dict[str, Any]:
        """
        Create Stripe Checkout Session
        
        Args:
            order_id: Order ID
            success_url: Success redirect URL
            cancel_url: Cancel redirect URL
            
        Returns:
            Checkout session details
        """
        
        order = self.db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise ValueError("Order not found")
        
        # Build line items
        line_items = []
        for item in order.items:
            line_items.append({
                'price_data': {
                    'currency': order.currency.lower(),
                    'product_data': {
                        'name': item.product_name,
                    },
                    'unit_amount': int(item.unit_price * 100),
                },
                'quantity': item.quantity,
            })
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'order_id': order_id
            }
        )
        
        # Update order with session ID
        order.payment_intent_id = session.payment_intent
        self.db.commit()
        
        return {
            'session_id': session.id,
            'url': session.url
        }
    
    async def get_payment_methods(self, customer_id: str) -> list:
        """
        Get customer's saved payment methods
        
        Args:
            customer_id: Stripe customer ID
            
        Returns:
            List of payment methods
        """
        
        payment_methods = stripe.PaymentMethod.list(
            customer=customer_id,
            type='card'
        )
        
        return [
            {
                'id': pm.id,
                'brand': pm.card.brand,
                'last4': pm.card.last4,
                'exp_month': pm.card.exp_month,
                'exp_year': pm.card.exp_year
            }
            for pm in payment_methods.data
        ]
    
    async def create_customer(
        self,
        email: str,
        name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create Stripe customer
        
        Args:
            email: Customer email
            name: Customer name
            metadata: Additional metadata
            
        Returns:
            Stripe customer ID
        """
        
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata=metadata or {}
        )
        
        return customer.id

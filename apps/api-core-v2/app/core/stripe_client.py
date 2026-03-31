"""
Stripe Connect client configuration for escrow payments.

Este módulo configura o Stripe SDK e fornece funções auxiliares para
gerenciar pagamentos com escrow no marketplace.
"""

import stripe
from typing import Optional
from app.core.config import settings

# Configurar Stripe com a chave secreta
stripe.api_key = settings.stripe_secret_key


def verify_webhook_signature(payload: bytes, sig_header: str) -> Optional[stripe.Event]:
    """
    Verifica a assinatura de um webhook do Stripe.
    
    Args:
        payload: Corpo da requisição em bytes
        sig_header: Header 'Stripe-Signature' da requisição
        
    Returns:
        Evento do Stripe se válido, None caso contrário
        
    Raises:
        ValueError: Se a assinatura for inválida
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
        return event
    except ValueError as e:
        # Payload inválido
        raise ValueError(f"Payload inválido do webhook: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        # Assinatura inválida
        raise ValueError(f"Assinatura do webhook inválida: {str(e)}")


async def create_payment_intent(
    amount: int,
    currency: str = "brl",
    metadata: Optional[dict] = None
) -> stripe.PaymentIntent:
    """
    Cria um PaymentIntent do Stripe.
    
    Args:
        amount: Valor em centavos (ex: 5000 = R$ 50,00)
        currency: Código da moeda (default: 'brl')
        metadata: Metadados adicionais
        
    Returns:
        PaymentIntent criado
    """
    return stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
        metadata=metadata or {},
        capture_method="manual"  # Permite hold para escrow
    )


async def capture_payment_intent(payment_intent_id: str, amount: Optional[int] = None) -> stripe.PaymentIntent:
    """
    Captura um PaymentIntent previamente autorizado.
    
    Args:
        payment_intent_id: ID do PaymentIntent
        amount: Valor a capturar em centavos (None = valor total)
        
    Returns:
        PaymentIntent capturado
    """
    return stripe.PaymentIntent.capture(
        payment_intent_id,
        amount_to_capture=amount
    )


async def cancel_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
    """
    Cancela um PaymentIntent (para refund de escrow).
    
    Args:
        payment_intent_id: ID do PaymentIntent
        
    Returns:
        PaymentIntent cancelado
    """
    return stripe.PaymentIntent.cancel(payment_intent_id)


async def create_transfer(
    amount: int,
    destination: str,
    currency: str = "brl",
    metadata: Optional[dict] = None
) -> stripe.Transfer:
    """
    Cria uma transferência para uma conta conectada (provider).
    
    Args:
        amount: Valor em centavos
        destination: ID da conta Stripe Connect do provider
        currency: Código da moeda
        metadata: Metadados adicionais
        
    Returns:
        Transfer criado
    """
    return stripe.Transfer.create(
        amount=amount,
        currency=currency,
        destination=destination,
        metadata=metadata or {}
    )


async def create_refund(
    payment_intent_id: str,
    amount: Optional[int] = None,
    reason: Optional[str] = None
) -> stripe.Refund:
    """
    Cria um reembolso para um PaymentIntent.
    
    Args:
        payment_intent_id: ID do PaymentIntent
        amount: Valor a reembolsar em centavos (None = valor total)
        reason: Motivo do reembolso ('duplicate', 'fraudulent', 'requested_by_customer')
        
    Returns:
        Refund criado
    """
    return stripe.Refund.create(
        payment_intent=payment_intent_id,
        amount=amount,
        reason=reason
    )

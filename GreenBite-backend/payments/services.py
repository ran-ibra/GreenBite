from subscriptions.models import Subscription
from .models import Payment
import logging

logger = logging.getLogger("payments")

def handle_success_payment(payment: Payment):
    """
    Handle successful payment (IDEMPOTENT)
    """
    if payment.status == Payment.SUCCESS:
        logger.info(
            "[PAYMENT SKIPPED] already successful | payment_id=%s",
            payment.id
        )
        return

    payment.status = Payment.SUCCESS
    payment.save(update_fields=["status"])

    subscription, _ = Subscription.objects.get_or_create(
        user=payment.user
    )
    subscription.activate(payment.subscription_plan)

    logger.info(
        "[PAYMENT SUCCESS] user=%s plan=%s payment_id=%s",
        payment.user_id,
        payment.subscription_plan_id,
        payment.id,
    )

def handle_failed_payment(payment: Payment):
    if payment.status == Payment.FAILED:
        return

    payment.status = Payment.FAILED
    payment.save(update_fields=["status"])

    logger.warning(
        "[PAYMENT FAILED] payment_id=%s",
        payment.id
    )

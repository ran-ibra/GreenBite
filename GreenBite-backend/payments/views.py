from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import Payment
from subscriptions.models import SubscriptionPlan, Subscription
from .paymob import create_payment_intention, verify_paymob_hmac
from .services import handle_success_payment, handle_failed_payment
import logging
import json

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_subscription_payment(request):
    plan_id = request.data.get("plan_id")

    if not plan_id:
        return Response(
            {"detail": "plan_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    plan = get_object_or_404(
        SubscriptionPlan,
        id=plan_id,
        is_active=True
    )

    payment = Payment.objects.create(
        user=request.user,
        subscription_plan=plan,
        amount=plan.price
    )

    data = create_payment_intention(
        amount=plan.price,
        user=request.user,
        subscription_plan=plan,
        notification_url=settings.PAYMOB_WEBHOOK_URL,
        redirection_url=settings.PAYMOB_REDIRECT_URL
    )
    payment.paymob_intention_id = data["id"]
    payment.client_secret = data["client_secret"]
    # Save the intention_order_id (Paymob order id) so webhook can match by order
    if data.get("intention_order_id"):
        payment.paymob_order_id = str(data.get("intention_order_id"))
    payment.save()

    checkout_url = (
        f"{settings.PAYMOB_BASE_URL}/unifiedcheckout/"
        f"?publicKey={settings.PAYMOB_PUBLIC_KEY}"
        f"&clientSecret={payment.client_secret}"
    )

    return Response(
        {"checkout_url": checkout_url},
        status=status.HTTP_201_CREATED
    )

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def paymob_webhook(request):
    logger.info("PAYMOB WEBHOOK hit: path=%s method=%s", request.get_full_path(), request.method)
    try:
        raw_body = request.body.decode("utf-8")
    except Exception:
        raw_body = "<binary>"

    # Log relevant incoming info (trim body length) at debug level
    logger.debug("PAYMOB headers=%s", dict(request.headers))
    logger.debug("PAYMOB query_params=%s", dict(request.query_params))
    logger.debug("PAYMOB raw_body_preview=%s", raw_body[:2000])

    received_hmac = request.query_params.get("hmac")

    # Robustly extract `data` whether payload is {"obj": {...}} or raw object
    data = None
    if isinstance(request.data, dict):
        data = request.data.get("obj") or request.data
    else:
        try:
            parsed = json.loads(raw_body) if raw_body else {}
            data = parsed.get("obj") if isinstance(parsed, dict) and "obj" in parsed else parsed
        except Exception:
            data = None

    if not received_hmac or not data:
        logger.warning(
            "Invalid webhook payload: hmac_present=%s data_present=%s",
            bool(received_hmac), bool(data)
        )
        return Response(
            {"detail": "Invalid webhook payload"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        verified = verify_paymob_hmac(received_hmac, data)
    except Exception as exc:
        logger.exception("Error during HMAC verification: %s", exc)
        return Response({"detail": "HMAC verification error"}, status=status.HTTP_400_BAD_REQUEST)

    logger.info("HMAC verified=%s", verified)
    if not verified:
        return Response({"detail": "Invalid HMAC"}, status=status.HTTP_403_FORBIDDEN)

    return handle_successful_payment(data)

def handle_successful_payment(data):
    success = data.get("success")
    order_id = data.get("order", {}).get("id")

    if not order_id:
        return Response(
            {"detail": "Missing order id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        payment = (
            Payment.objects.filter(paymob_order_id=str(order_id)).first()
            or Payment.objects.filter(paymob_intention_id=str(data.get("id"))).first()
        )

        if not payment:
            logger.error(
                "[WEBHOOK] Payment not found | order_id=%s",
                order_id
            )
            return Response(
                {"detail": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as exc:
        logger.exception("Payment lookup error: %s", exc)
        return Response(
            {"detail": "Internal error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Save order_id once (safe)
    if not payment.paymob_order_id:
        payment.paymob_order_id = str(order_id)
        payment.save(update_fields=["paymob_order_id"])

    # ✅ Idempotent handling
    if success:
        handle_success_payment(payment)
    else:
        handle_failed_payment(payment)

    logger.info(
        "[WEBHOOK OK] payment_id=%s success=%s",
        payment.id,
        success
    )

    return Response({"status": "ok"}, status=status.HTTP_200_OK)
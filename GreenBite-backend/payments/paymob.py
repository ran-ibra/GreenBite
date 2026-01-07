import requests
from django.conf import settings
import hmac
import hashlib
import logging

logger = logging.getLogger(__name__)


def create_payment_intention(
    *,
    amount,
    user,
    subscription_plan,
    notification_url,
    redirection_url
):
    url = f"{settings.PAYMOB_BASE_URL}/v1/intention/"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {settings.PAYMOB_SECRET_KEY}",
    }

    payload = {
        "amount": amount,  # 👈 بالجنيه زي Postman
        "currency": "EGP",
        "payment_methods": [
            int(settings.PAYMOB_INTEGRATION_ID)
        ],
        "items": [
            {
                "name": subscription_plan.name,
                "amount": amount,
                "description": f"{subscription_plan.duration} subscription",
                "quantity": 1,
            }
        ],
        "billing_data": {
            "first_name": user.first_name or "User",
            "last_name": user.last_name or "User",
            "email": user.email,
            "phone_number": "+201000000000",
            "city": "Cairo",
            "country": "EG",
            "street": "NA",
            "building": "NA",
            "floor": "NA",
            "apartment": "NA",
            "state": "NA",
        },
        "notification_url": notification_url,
        "redirection_url": redirection_url,
    }

    response = requests.post(url, json=payload, headers=headers)

    logger.info("PAYMOB STATUS: %s", response.status_code)
    logger.debug("PAYMOB RESPONSE: %s", response.text)

    response.raise_for_status()
    return response.json()

def verify_paymob_hmac(received_hmac, data):
    hmac_fields = [
        "amount_cents",
        "created_at",
        "currency",
        "error_occured",
        "has_parent_transaction",
        "id",
        "integration_id",
        "is_3d_secure",
        "is_auth",
        "is_capture",
        "is_refunded",
        "is_standalone_payment",
        "is_voided",
        "order.id",
        "owner",
        "pending",
        "source_data.pan",
        "source_data.sub_type",
        "source_data.type",
        "success",
    ]

    def get_nested_value(obj, path):
        for key in path:
            if not isinstance(obj, dict):
                return ""
            obj = obj.get(key)
            if obj is None:
                return ""
        # Paymob uses lowercase true/false
        if isinstance(obj, bool):
            return str(obj).lower()
        return str(obj)

    concatenated = ""
    for field in hmac_fields:
        keys = field.split(".")
        concatenated += get_nested_value(data, keys)

    calculated_hmac = hmac.new(
        settings.PAYMOB_HMAC_SECRET.encode(),
        concatenated.encode(),
        hashlib.sha512
    ).hexdigest()

    # Debug output (keep at debug level)
    logger.debug("PAYMOB CONCAT: %s", concatenated)
    logger.debug("CALC HMAC: %s", calculated_hmac)
    logger.debug("RECV HMAC: %s", received_hmac)

    return hmac.compare_digest(calculated_hmac, received_hmac)

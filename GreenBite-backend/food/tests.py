from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from food.models import FoodLogSys, WasteLog

TEST_CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
        "TIMEOUT": 60,
    }
}

@override_settings(CACHES=TEST_CACHES)
class FoodLogSysAPITests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="user1@test.com",
            password="pass1234",
            is_active=True,
        )
        self.other_user = User.objects.create_user(
            email="user2@test.com",
            password="pass1234",
            is_active=True,
        )

        self.client.force_authenticate(user=self.user)

        self.list_url = "/api/food-logs/"
        
    def _create_food_log(self, *, user=None, **overrides):
        u = user or self.user
        data = {
            "user": u,  # model-level, serializer ignores in POST
            "name": overrides.get("name", "Tomatoes"),
            "quantity": overrides.get("quantity", Decimal("2.50")),
            "unit": overrides.get("unit", "kg"),
            "category": overrides.get("category", "vegetable"),
            "expiry_date": overrides.get("expiry_date", date.today() + timedelta(days=5)),
            "storage_type": overrides.get("storage_type", "fridge"),
            "is_consumed": overrides.get("is_consumed", False),
        }
        return FoodLogSys.objects.create(**data)
    
    #Auth test
    def test_food_logs_requires_authentication(self):
        self.client.force_authenticate(user=None)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_food_log_success(self):
        payload = {
            "name": "Milk",
            "quantity": "1.00",
            "unit": "L",
            "category": "dairy",
            "expiry_date": str(date.today() + timedelta(days=3)),
            "storage_type": "fridge",
        }
        res = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        self.assertTrue(FoodLogSys.objects.filter(user=self.user, name="Milk").exists())
    
    #Create / List
    def test_create_food_log_validation_error(self):
        # Missing required fields ...
        res = self.client.post(self.list_url, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_food_logs_returns_only_my_logs(self):
        self._create_food_log(user=self.user, name="Apples")
        self._create_food_log(user=self.other_user, name="Bananas")

        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Paginated response: {count, next, previous, results}
        results = res.data.get("results", [])
        names = [item["name"] for item in results]

        self.assertIn("Apples", names)
        self.assertNotIn("Bananas", names)

    #filters
    def test_filter_by_category(self):
        self._create_food_log(name="Apples", category="fruit")
        self._create_food_log(name="Bread", category="bread")

        res = self.client.get(self.list_url + "?category=fruit")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        results = res.data.get("results", [])
        self.assertTrue(all(item["category"] == "fruit" for item in results))

    def test_sort_by_expiry_date_desc(self):
        self._create_food_log(name="Soon", expiry_date=date.today() + timedelta(days=1))
        self._create_food_log(name="Later", expiry_date=date.today() + timedelta(days=10))

        res = self.client.get(self.list_url + "?sort_by=expiry_date&sort_order=desc")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        results = res.data.get("results", [])
        self.assertGreaterEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Later")
        self.assertEqual(results[1]["name"], "Soon")

    #FoodLogDetail Test
    def test_get_food_log_detail_success(self):
        log = self._create_food_log(name="Yogurt")
        res = self.client.get(f"/api/food-logs/{log.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Yogurt")

    def test_get_food_log_detail_other_user_is_404(self):
        other_log = self._create_food_log(user=self.other_user, name="Private")
        res = self.client.get(f"/api/food-logs/{other_log.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)    

    def test_patch_food_log_success(self):
        log = self._create_food_log(name="Cheese", quantity=Decimal("2.00"))
        res = self.client.patch(
            f"/api/food-logs/{log.id}/",
            {"quantity": "3.00"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        log.refresh_from_db()
        self.assertEqual(log.quantity, Decimal("3.00"))

    def test_delete_food_log_success(self):
        log = self._create_food_log(name="To Delete")
        res = self.client.delete(f"/api/food-logs/{log.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FoodLogSys.objects.filter(id=log.id).exists())
    
@override_settings(CACHES=TEST_CACHES)
class WasteLogAPITests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="waste1@test.com",
            password="pass1234",
            is_active=True,
        )
        self.other_user = User.objects.create_user(
            email="waste2@test.com",
            password="pass1234",
            is_active=True,
        )
        self.client.force_authenticate(user=self.user)

        self.list_url = "/api/waste-log/"

    def _create_waste_log(self, *, user=None, **overrides):
        u = user or self.user
        data = {
            "user": u,
            "meal": overrides.get("meal", None),
            "name": overrides.get("name", "Spoiled Bread"),
            "why": overrides.get("why", "Left it outside"),
            "estimated_amount": overrides.get("estimated_amount", Decimal("1.50")),
            "unit": overrides.get("unit", "kg"),
            "disposal": overrides.get("disposal", "trash"),
            "reuse_ideas": overrides.get("reuse_ideas", ["compost if safe"]),
        }
        return WasteLog.objects.create(**data)
    
    def test_waste_log_requires_authentication(self):
        self.client.force_authenticate(user=None)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_waste_log_success(self):
        payload = {
            "name": "Old Lettuce",
            "why": "Forgot in fridge",
            "estimated_amount": "0.75",
            "unit": "kg",
            "disposal": "compost",
            "reuse_ideas": ["compost", "garden soil"],
            "meal": None,
        }
        res = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(WasteLog.objects.filter(user=self.user, name="Old Lettuce").exists())

    def test_list_waste_logs_only_mine(self):
        self._create_waste_log(user=self.user, name="Mine")
        self._create_waste_log(user=self.other_user, name="NotMine")

        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        results = res.data.get("results", res.data)  # sometimes paginated, sometimes not
        names = [item["name"] for item in results]

        self.assertIn("Mine", names)
        self.assertNotIn("NotMine", names)

    def test_get_waste_log_detail(self):
        log = self._create_waste_log(name="DetailTest")
        res = self.client.get(f"/api/waste-log/{log.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "DetailTest")

    def test_waste_log_detail_other_user_is_404(self):
        other_log = self._create_waste_log(user=self.other_user, name="PrivateWaste")
        res = self.client.get(f"/api/waste-log/{other_log.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_waste_log_success(self):
        log = self._create_waste_log(name="PatchMe", disposal="trash")
        res = self.client.patch(
            f"/api/waste-log/{log.id}/",
            {"disposal": "compost"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        log.refresh_from_db()
        self.assertEqual(log.disposal, "compost")

    def test_delete_waste_log_success(self):
        log = self._create_waste_log(name="DeleteMe")
        res = self.client.delete(f"/api/waste-log/{log.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WasteLog.objects.filter(id=log.id).exists())
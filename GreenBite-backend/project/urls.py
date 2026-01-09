"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static



from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from payments.views import paymob_webhook


schema_view = get_schema_view(
    openapi.Info(
        title="GreenBite API",
        default_version="v1",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    patterns=[
        path("api/", include("subscriptions.urls")),
        path("auth/", include("djoser.urls")),
        path("auth/", include("djoser.urls.jwt")),
        re_path(r"^api/webhook/?$", paymob_webhook), # (handles both /api/webhook and /api/webhook/)
        path("api/", include("payments.urls")),
        path("admin/", admin.site.urls),

        
        path('api/', include('recipes.urls')),
        path("api/", include("accounts.urls")),
        path('api/meal_plans/', include('meal_plans.urls')),
        path("api/", include("subscriptions.urls")),
    ],
)



urlpatterns = [
    # Accept webhook with or without trailing slash (Paymob may call either)
    re_path(r"^api/webhook/?$", paymob_webhook), # (handles both /api/webhook and /api/webhook/)
    path("api/", include("payments.urls")),
    path("admin/", admin.site.urls),


    # Djoser endpoints
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),

    # App endpoints
    path("api/", include("food.urls")),
    path('api/', include('recipes.urls')),
    path("api/", include("accounts.urls")),
    path('api/meal_plans/', include('meal_plans.urls')),
    path("api/", include("subscriptions.urls")),

    # Swagger
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

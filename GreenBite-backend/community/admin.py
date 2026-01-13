from django.contrib import admin

# Register your models here.

from .models import CommunityProfile , MarketOrder , ComMarket , MarketReview , CommunityParent


admin.site.register(CommunityProfile) 
admin.site.register(MarketOrder)
admin.site.register(ComMarket)
admin.site.register(MarketReview)
admin.site.register(CommunityParent)
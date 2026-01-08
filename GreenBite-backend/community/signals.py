from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import User
from community.models import CommunityProfile

@receiver(post_save, sender=User)
def create_community_profile(sender, instance, created, **kwargs):
    if created:
        CommunityProfile.objects.create(user=instance)

from django.core.management.base import BaseCommand
from subscriptions.signals import setup_periodic_tasks

class Command(BaseCommand):
    help = "Setup periodic celery beat tasks for subscriptions"

    def handle(self, *args, **options):
        setup_periodic_tasks()
        self.stdout.write(
            self.style.SUCCESS("Periodic subscription tasks created/updated")
        )

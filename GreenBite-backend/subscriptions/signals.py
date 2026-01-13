import json
from django_celery_beat.models import PeriodicTask, IntervalSchedule


def setup_periodic_tasks():
    schedule, _ = IntervalSchedule.objects.get_or_create(
        every=1,
        period=IntervalSchedule.HOURS,
    )

    PeriodicTask.objects.get_or_create(
        name="Expire subscriptions every hour",
        task="subscriptions.tasks.expire_subscriptions",
        interval=schedule,
        defaults={"args": json.dumps([])},
    )

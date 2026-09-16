from django.core.management.base import BaseCommand
from expenses.gamification import seed_gamification_data


class Command(BaseCommand):
    help = 'Seeds initial gamification quests and achievements'

    def handle(self, *args, **options):
        seed_gamification_data()
        self.stdout.write(self.style.SUCCESS('Successfully seeded gamification quests and achievements!'))

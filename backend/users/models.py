from datetime import date, timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager

RANK_TIERS = [
    (1, 0, 200, "Coin Initiate"),
    (2, 200, 500, "Budget Novice"),
    (3, 500, 900, "Expense Scout"),
    (4, 900, 1400, "Budget Ranger"),
    (5, 1400, 2000, "Thrift Warrior"),
    (6, 2000, 2800, "Savings Knight"),
    (7, 2800, 3800, "Finance Paladin"),
    (8, 3800, 5000, "Wealth Master"),
    (9, 5000, 6500, "Treasury Lord"),
    (10, 6500, 10000, "Grand Fiscal Sage"),
]


class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)

    # RPG Gamification Fields
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    rank_title = models.CharField(max_length=100, default="Coin Initiate")
    streak_days = models.PositiveIntegerField(default=0)
    last_expense_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def current_tier_info(self):
        for lvl, min_xp, max_xp, title in RANK_TIERS:
            if self.xp < max_xp:
                return {
                    'level': lvl,
                    'rank_title': title,
                    'min_xp': min_xp,
                    'max_xp': max_xp,
                    'current_xp': self.xp,
                    'progress_percent': min(100, max(0, round(((self.xp - min_xp) / (max_xp - min_xp)) * 100, 1)))
                }
        # Max level reached
        return {
            'level': 10,
            'rank_title': "Grand Fiscal Sage",
            'min_xp': 6500,
            'max_xp': 10000,
            'current_xp': self.xp,
            'progress_percent': 100
        }

    def update_rpg_stats(self):
        info = self.current_tier_info
        leveled_up = info['level'] > self.level
        self.level = info['level']
        self.rank_title = info['rank_title']
        return leveled_up

    def add_xp(self, amount):
        self.xp += amount
        leveled_up = self.update_rpg_stats()
        self.save()
        return {
            'xp_added': amount,
            'total_xp': self.xp,
            'level': self.level,
            'rank_title': self.rank_title,
            'leveled_up': leveled_up
        }

    def update_streak(self, expense_date):
        today = expense_date or date.today()
        if not self.last_expense_date:
            self.streak_days = 1
        elif self.last_expense_date == today:
            # Already logged today, keep current streak
            pass
        elif self.last_expense_date == today - timedelta(days=1):
            self.streak_days += 1
        else:
            # Streak broken
            self.streak_days = 1
        
        self.last_expense_date = today
        self.save()

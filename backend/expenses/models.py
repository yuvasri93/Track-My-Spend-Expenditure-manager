from django.db import models
from django.conf import settings
from django.utils import timezone


class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Transport', 'Transport'),
        ('Education', 'Education'),
        ('Shopping', 'Shopping'),
        ('Entertainment', 'Entertainment'),
        ('Bills', 'Bills'),
        ('Health', 'Health'),
        ('Other', 'Other'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('UPI', 'UPI'),
        ('Card', 'Card'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    date = models.DateField(default=timezone.now)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - ₹{self.amount} ({self.category})"


class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    month = models.CharField(max_length=7)  # Format: YYYY-MM
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.user.email} - {self.month}: ₹{self.amount}"


class Quest(models.Model):
    QUEST_TYPE_CHOICES = [
        ('DAILY', 'Daily Quest'),
        ('WEEKLY', 'Weekly Quest'),
        ('MILESTONE', 'Milestone Quest'),
    ]

    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    quest_type = models.CharField(max_length=50, choices=QUEST_TYPE_CHOICES, default='DAILY')
    target_count = models.PositiveIntegerField(default=1)
    xp_reward = models.PositiveIntegerField(default=50)
    icon = models.CharField(max_length=50, default='target')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.title} (+{self.xp_reward} XP)"


class UserQuest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_quests')
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE, related_name='user_progress')
    current_count = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    is_claimed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    claimed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'quest')

    def __str__(self):
        return f"{self.user.email} - {self.quest.title} ({self.current_count}/{self.quest.target_count})"


class Achievement(models.Model):
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    badge_icon = models.CharField(max_length=50, default='award')
    xp_reward = models.PositiveIntegerField(default=100)
    requirement_type = models.CharField(max_length=50)
    target_value = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.title} ({self.code})"


class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='unlocked_users')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.email} unlocked {self.achievement.title}"

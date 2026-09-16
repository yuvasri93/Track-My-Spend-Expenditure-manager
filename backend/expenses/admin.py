from django.contrib import admin
from .models import Expense, Budget, Quest, UserQuest, Achievement, UserAchievement


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'category', 'payment_method', 'date', 'user')
    list_filter = ('category', 'payment_method', 'date')
    search_fields = ('description', 'notes', 'user__email', 'user__full_name')


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'month', 'amount', 'created_at')
    list_filter = ('month',)
    search_fields = ('user__email', 'user__full_name')


@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'quest_type', 'target_count', 'xp_reward', 'order')
    list_filter = ('quest_type',)


@admin.register(UserQuest)
class UserQuestAdmin(admin.ModelAdmin):
    list_display = ('user', 'quest', 'current_count', 'is_completed', 'is_claimed')
    list_filter = ('is_completed', 'is_claimed')
    search_fields = ('user__email', 'quest__title')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'xp_reward', 'requirement_type', 'target_value')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    search_fields = ('user__email', 'achievement__title')

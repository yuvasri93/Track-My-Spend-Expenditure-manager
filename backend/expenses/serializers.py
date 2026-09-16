from decimal import Decimal
from rest_framework import serializers
from .models import Expense, Budget, Quest, UserQuest, Achievement, UserAchievement


class ExpenseSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))

    class Meta:
        model = Expense
        fields = (
            'id',
            'amount',
            'description',
            'category',
            'date',
            'payment_method',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required.")
        return value.strip()


class BudgetSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('1.00'))

    class Meta:
        model = Budget
        fields = ('id', 'month', 'amount', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class QuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quest
        fields = ('id', 'code', 'title', 'description', 'quest_type', 'target_count', 'xp_reward', 'icon')


class UserQuestSerializer(serializers.ModelSerializer):
    quest = QuestSerializer(read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = UserQuest
        fields = (
            'id',
            'quest',
            'current_count',
            'is_completed',
            'is_claimed',
            'completed_at',
            'claimed_at',
            'progress_percent',
        )

    def get_progress_percent(self, obj):
        if obj.quest.target_count == 0:
            return 100
        pct = (obj.current_count / obj.quest.target_count) * 100
        return min(100, round(pct, 1))


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ('id', 'code', 'title', 'description', 'badge_icon', 'xp_reward', 'requirement_type', 'target_value')


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ('id', 'achievement', 'unlocked_at')

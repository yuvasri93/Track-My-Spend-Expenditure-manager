from datetime import date
from django.utils import timezone
from .models import Quest, UserQuest, Achievement, UserAchievement, Expense, Budget

DEFAULT_QUESTS = [
    {
        'code': 'FIRST_EXPENSE',
        'title': 'First Step on the Path',
        'description': 'Log your very first expense record in Track My Spend.',
        'quest_type': 'MILESTONE',
        'target_count': 1,
        'xp_reward': 50,
        'icon': 'zap',
        'order': 1,
    },
    {
        'code': 'DAILY_LOG',
        'title': 'Daily Discipline',
        'description': 'Log an expense for today to keep your finances in check.',
        'quest_type': 'DAILY',
        'target_count': 1,
        'xp_reward': 30,
        'icon': 'calendar',
        'order': 2,
    },
    {
        'code': 'BUDGET_SET',
        'title': 'Budget Blueprint',
        'description': 'Set your monthly budget target.',
        'quest_type': 'MILESTONE',
        'target_count': 1,
        'xp_reward': 50,
        'icon': 'shield',
        'order': 3,
    },
    {
        'code': 'THREE_CATEGORIES',
        'title': 'Category Explorer',
        'description': 'Track expenses in at least 3 distinct categories.',
        'quest_type': 'WEEKLY',
        'target_count': 3,
        'xp_reward': 60,
        'icon': 'grid',
        'order': 4,
    },
    {
        'code': 'FIVE_EXPENSES',
        'title': 'Expense Collector',
        'description': 'Record 5 transactions to build a solid history.',
        'quest_type': 'WEEKLY',
        'target_count': 5,
        'xp_reward': 75,
        'icon': 'sword',
        'order': 5,
    },
    {
        'code': 'STREAK_3',
        'title': 'Momentum Builder',
        'description': 'Maintain a 3-day consecutive spending tracking streak.',
        'quest_type': 'WEEKLY',
        'target_count': 3,
        'xp_reward': 70,
        'icon': 'flame',
        'order': 6,
    },
    {
        'code': 'STREAK_7',
        'title': 'Fiscal Fortitude',
        'description': 'Reach a full 7-day expense tracking streak.',
        'quest_type': 'MILESTONE',
        'target_count': 7,
        'xp_reward': 120,
        'icon': 'crown',
        'order': 7,
    },
]

DEFAULT_ACHIEVEMENTS = [
    {
        'code': 'ACH_FIRST',
        'title': 'First Blood',
        'description': 'Recorded your very first expense in the system.',
        'badge_icon': 'sparkles',
        'xp_reward': 50,
        'requirement_type': 'FIRST_EXPENSE',
        'target_value': 1,
    },
    {
        'code': 'ACH_BUDGET_SET',
        'title': 'The Architect',
        'description': 'Defined a monthly budget target for the first time.',
        'badge_icon': 'compass',
        'xp_reward': 60,
        'requirement_type': 'BUDGET_SET',
        'target_value': 1,
    },
    {
        'code': 'ACH_STREAK_3',
        'title': 'Spark of Habit',
        'description': 'Tracked expenses for 3 consecutive days.',
        'badge_icon': 'flame',
        'xp_reward': 80,
        'requirement_type': 'STREAK',
        'target_value': 3,
    },
    {
        'code': 'ACH_STREAK_7',
        'title': 'Iron Will',
        'description': 'Achieved a legendary 7-day tracking streak.',
        'badge_icon': 'zap',
        'xp_reward': 150,
        'requirement_type': 'STREAK',
        'target_value': 7,
    },
    {
        'code': 'ACH_TX_10',
        'title': 'Decathlete',
        'description': 'Logged 10 total transactions.',
        'badge_icon': 'check-circle',
        'xp_reward': 100,
        'requirement_type': 'TRANSACTIONS',
        'target_value': 10,
    },
    {
        'code': 'ACH_TX_25',
        'title': 'Grand Archivist',
        'description': 'Logged 25 total transactions.',
        'badge_icon': 'book-open',
        'xp_reward': 200,
        'requirement_type': 'TRANSACTIONS',
        'target_value': 25,
    },
    {
        'code': 'ACH_MULTI_CAT',
        'title': 'Diverse Portfolio',
        'description': 'Logged expenses across at least 4 different categories.',
        'badge_icon': 'pie-chart',
        'xp_reward': 90,
        'requirement_type': 'CATEGORIES',
        'target_value': 4,
    },
    {
        'code': 'ACH_PAYMENT_VARIETY',
        'title': 'Omni-Payer',
        'description': 'Logged transactions with at least 3 payment methods.',
        'badge_icon': 'credit-card',
        'xp_reward': 80,
        'requirement_type': 'PAYMENTS',
        'target_value': 3,
    },
]


def seed_gamification_data():
    """Seeds master quests and achievements in the database."""
    for q_data in DEFAULT_QUESTS:
        Quest.objects.update_or_create(
            code=q_data['code'],
            defaults=q_data
        )

    for a_data in DEFAULT_ACHIEVEMENTS:
        Achievement.objects.update_or_create(
            code=a_data['code'],
            defaults=a_data
        )


def initialize_user_gamification(user):
    """Initializes user quests when a user registers or requests quest list."""
    seed_gamification_data()
    all_quests = Quest.objects.all()
    for quest in all_quests:
        UserQuest.objects.get_or_create(
            user=user,
            quest=quest,
            defaults={'current_count': 0, 'is_completed': False, 'is_claimed': False}
        )


def check_and_unlock_achievement(user, code):
    """Unlocks an achievement for a user if not already unlocked."""
    try:
        ach = Achievement.objects.get(code=code)
    except Achievement.DoesNotExist:
        return None

    ua, created = UserAchievement.objects.get_or_create(user=user, achievement=ach)
    if created:
        user.add_xp(ach.xp_reward)
        return {
            'code': ach.code,
            'title': ach.title,
            'description': ach.description,
            'xp_reward': ach.xp_reward,
            'badge_icon': ach.badge_icon,
        }
    return None


def process_gamification_on_expense(user, expense):
    """
    Core engine called whenever an expense is created.
    Awards base XP, updates streak, checks quests, unlocks achievements.
    """
    initialize_user_gamification(user)

    # 1. Base XP for recording an expense (+20 XP)
    xp_res = user.add_xp(20)

    # 2. Update streak
    user.update_streak(expense.date)

    # 3. Gather user stats
    total_expenses_count = Expense.objects.filter(user=user).count()
    distinct_categories = Expense.objects.filter(user=user).values_list('category', flat=True).distinct().count()
    distinct_payments = Expense.objects.filter(user=user).values_list('payment_method', flat=True).distinct().count()
    today_expense_exists = Expense.objects.filter(user=user, date=date.today()).exists()

    unlocked_achievements = []

    # Check Achievements
    if total_expenses_count >= 1:
        u = check_and_unlock_achievement(user, 'ACH_FIRST')
        if u: unlocked_achievements.append(u)

    if total_expenses_count >= 10:
        u = check_and_unlock_achievement(user, 'ACH_TX_10')
        if u: unlocked_achievements.append(u)

    if total_expenses_count >= 25:
        u = check_and_unlock_achievement(user, 'ACH_TX_25')
        if u: unlocked_achievements.append(u)

    if user.streak_days >= 3:
        u = check_and_unlock_achievement(user, 'ACH_STREAK_3')
        if u: unlocked_achievements.append(u)

    if user.streak_days >= 7:
        u = check_and_unlock_achievement(user, 'ACH_STREAK_7')
        if u: unlocked_achievements.append(u)

    if distinct_categories >= 4:
        u = check_and_unlock_achievement(user, 'ACH_MULTI_CAT')
        if u: unlocked_achievements.append(u)

    if distinct_payments >= 3:
        u = check_and_unlock_achievement(user, 'ACH_PAYMENT_VARIETY')
        if u: unlocked_achievements.append(u)

    # Check Quests Progress
    user_quests = UserQuest.objects.filter(user=user)
    completed_quests = []

    for uq in user_quests:
        q = uq.quest
        current = 0
        if q.code == 'FIRST_EXPENSE':
            current = min(q.target_count, total_expenses_count)
        elif q.code == 'DAILY_LOG':
            current = 1 if today_expense_exists else 0
        elif q.code == 'THREE_CATEGORIES':
            current = min(q.target_count, distinct_categories)
        elif q.code == 'FIVE_EXPENSES':
            current = min(q.target_count, total_expenses_count)
        elif q.code == 'STREAK_3':
            current = min(q.target_count, user.streak_days)
        elif q.code == 'STREAK_7':
            current = min(q.target_count, user.streak_days)

        if current > uq.current_count:
            uq.current_count = current

        if uq.current_count >= q.target_count and not uq.is_completed:
            uq.is_completed = True
            uq.completed_at = timezone.now()
            completed_quests.append({
                'id': uq.id,
                'title': q.title,
                'xp_reward': q.xp_reward,
                'icon': q.icon,
            })

        uq.save()

    return {
        'xp_awarded': 20,
        'current_xp': user.xp,
        'level': user.level,
        'rank_title': user.rank_title,
        'streak_days': user.streak_days,
        'leveled_up': xp_res['leveled_up'],
        'unlocked_achievements': unlocked_achievements,
        'completed_quests': completed_quests,
    }


def process_gamification_on_budget(user):
    """
    Called when a budget is set or updated.
    """
    initialize_user_gamification(user)

    # Award budget XP if setting for the first time
    budget_count = Budget.objects.filter(user=user).count()
    unlocked_achievements = []

    u = check_and_unlock_achievement(user, 'ACH_BUDGET_SET')
    if u: unlocked_achievements.append(u)

    # Check quest
    try:
        budget_quest = Quest.objects.get(code='BUDGET_SET')
        uq, _ = UserQuest.objects.get_or_create(user=user, quest=budget_quest)
        uq.current_count = 1
        if not uq.is_completed:
            uq.is_completed = True
            uq.completed_at = timezone.now()
        uq.save()
    except Quest.DoesNotExist:
        pass

    return {
        'unlocked_achievements': unlocked_achievements
    }

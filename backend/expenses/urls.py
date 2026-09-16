from django.urls import path
from .views import (
    ExpenseListCreateView,
    ExpenseDetailView,
    BudgetView,
    DashboardStatsView,
    QuestListView,
    QuestClaimView,
    AchievementListView,
)

urlpatterns = [
    # Expenses CRUD
    path('expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),

    # Budget
    path('budget/', BudgetView.as_view(), name='budget'),

    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),

    # RPG Gamification
    path('quests/', QuestListView.as_view(), name='quests_list'),
    path('quests/<int:pk>/claim/', QuestClaimView.as_view(), name='quest_claim'),
    path('achievements/', AchievementListView.as_view(), name='achievements_list'),
]

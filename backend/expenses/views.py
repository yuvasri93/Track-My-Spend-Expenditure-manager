from datetime import date, datetime
from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Expense, Budget, Quest, UserQuest, Achievement, UserAchievement
from .serializers import (
    ExpenseSerializer,
    BudgetSerializer,
    UserQuestSerializer,
    AchievementSerializer,
    UserAchievementSerializer,
)
from .gamification import (
    process_gamification_on_expense,
    process_gamification_on_budget,
    initialize_user_gamification,
)


class ExpenseListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Expense.objects.filter(user=user)

        # Filters
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(category__icontains=search) |
                Q(notes__icontains=search)
            )

        category = request.query_params.get('category', '').strip()
        if category and category != 'All':
            queryset = queryset.filter(category=category)

        payment_method = request.query_params.get('payment_method', '').strip()
        if payment_method and payment_method != 'All':
            queryset = queryset.filter(payment_method=payment_method)

        month = request.query_params.get('month', '').strip()
        if month:
            # format YYYY-MM
            try:
                year, m = map(int, month.split('-'))
                queryset = queryset.filter(date__year=year, date__month=m)
            except ValueError:
                pass

        start_date = request.query_params.get('start_date', '').strip()
        if start_date:
            queryset = queryset.filter(date__gte=start_date)

        end_date = request.query_params.get('end_date', '').strip()
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Ordering
        ordering = request.query_params.get('ordering', '-date').strip()
        valid_orderings = ['date', '-date', 'amount', '-amount', 'category', '-category']
        if ordering in valid_orderings:
            if ordering in ['date', '-date']:
                queryset = queryset.order_by(ordering, '-created_at')
            else:
                queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-date', '-created_at')

        # Aggregation totals for current filtered set
        total_sum = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        count = queryset.count()

        serializer = ExpenseSerializer(queryset, many=True)
        return Response({
            'count': count,
            'total_amount': float(total_sum),
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            expense = serializer.save(user=request.user)
            # Process RPG Gamification: XP, Streaks, Quests, Achievements
            gamification_result = process_gamification_on_expense(request.user, expense)

            return Response({
                'message': 'Expense created successfully!',
                'expense': serializer.data,
                'gamification': gamification_result
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Expense.objects.get(pk=pk, user=user)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Expense updated successfully.',
                'expense': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'detail': 'Expense not found.'}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response({'message': 'Expense deleted successfully.'}, status=status.HTTP_200_OK)


class BudgetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = request.query_params.get('month', timezone.now().strftime('%Y-%m'))
        try:
            budget = Budget.objects.get(user=request.user, month=month)
            serializer = BudgetSerializer(budget)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Budget.DoesNotExist:
            return Response({
                'month': month,
                'amount': 0.00,
                'is_set': False
            }, status=status.HTTP_200_OK)

    def post(self, request):
        month = request.data.get('month', timezone.now().strftime('%Y-%m'))
        amount = request.data.get('amount')

        if amount is None:
            return Response({'amount': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_val = Decimal(str(amount))
            if amount_val <= 0:
                return Response({'amount': 'Budget must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'amount': 'Invalid amount value.'}, status=status.HTTP_400_BAD_REQUEST)

        budget, created = Budget.objects.update_or_create(
            user=request.user,
            month=month,
            defaults={'amount': amount_val}
        )

        gamification_result = process_gamification_on_budget(request.user)

        serializer = BudgetSerializer(budget)
        return Response({
            'message': 'Budget updated successfully!',
            'budget': serializer.data,
            'gamification': gamification_result
        }, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        initialize_user_gamification(user)

        today = date.today()
        current_month_str = today.strftime('%Y-%m')
        selected_month = request.query_params.get('month', current_month_str)

        try:
            sel_year, sel_month = map(int, selected_month.split('-'))
        except ValueError:
            sel_year, sel_month = today.year, today.month
            selected_month = current_month_str

        month_expenses = Expense.objects.filter(
            user=user,
            date__year=sel_year,
            date__month=sel_month
        )

        total_spent = month_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        transactions_count = month_expenses.count()

        # Monthly Budget
        try:
            budget_obj = Budget.objects.get(user=user, month=selected_month)
            monthly_budget = budget_obj.amount
            budget_is_set = True
        except Budget.DoesNotExist:
            monthly_budget = Decimal('0.00')
            budget_is_set = False

        remaining = monthly_budget - total_spent
        is_budget_exceeded = monthly_budget > 0 and total_spent > monthly_budget
        exceeded_amount = (total_spent - monthly_budget) if is_budget_exceeded else Decimal('0.00')

        if monthly_budget > 0:
            budget_progress_percent = min(100.0, round(float(total_spent / monthly_budget * 100), 1))
        else:
            budget_progress_percent = 0.0

        # Average Daily Spending
        # If current month, use today.day; else days in that month
        if sel_year == today.year and sel_month == today.month:
            days_count = max(1, today.day)
        else:
            import calendar
            _, days_count = calendar.monthrange(sel_year, sel_month)

        avg_daily_spending = round(float(total_spent) / days_count, 2)

        # Category Breakdown
        categories_data = (
            month_expenses.values('category')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )
        category_breakdown = []
        for cat in categories_data:
            cat_total = float(cat['total'])
            pct = round((cat_total / float(total_spent) * 100), 1) if total_spent > 0 else 0
            category_breakdown.append({
                'category': cat['category'],
                'amount': cat_total,
                'count': cat['count'],
                'percentage': pct
            })

        # Recent 5 expenses
        recent_expenses_qs = Expense.objects.filter(user=user).order_by('-date', '-created_at')[:5]
        recent_serializer = ExpenseSerializer(recent_expenses_qs, many=True)

        tier_info = user.current_tier_info

        return Response({
            'month': selected_month,
            'total_spent': float(total_spent),
            'monthly_budget': float(monthly_budget),
            'remaining': float(remaining),
            'budget_is_set': budget_is_set,
            'budget_progress_percent': budget_progress_percent,
            'is_budget_exceeded': is_budget_exceeded,
            'exceeded_amount': float(exceeded_amount),
            'transactions_count': transactions_count,
            'average_daily_spending': avg_daily_spending,
            'category_breakdown': category_breakdown,
            'recent_expenses': recent_serializer.data,
            'character': {
                'user_name': user.full_name,
                'email': user.email,
                'level': user.level,
                'rank_title': user.rank_title,
                'xp': user.xp,
                'streak_days': user.streak_days,
                'min_xp': tier_info['min_xp'],
                'max_xp': tier_info['max_xp'],
                'progress_percent': tier_info['progress_percent']
            }
        }, status=status.HTTP_200_OK)


class QuestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        initialize_user_gamification(request.user)
        user_quests = UserQuest.objects.filter(user=request.user).select_related('quest').order_by('quest__order', 'id')
        serializer = UserQuestSerializer(user_quests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuestClaimView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            uq = UserQuest.objects.get(pk=pk, user=request.user)
        except UserQuest.DoesNotExist:
            return Response({'detail': 'Quest not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not uq.is_completed:
            return Response({'detail': 'Quest is not yet completed.'}, status=status.HTTP_400_BAD_REQUEST)

        if uq.is_claimed:
            return Response({'detail': 'Quest reward already claimed.'}, status=status.HTTP_400_BAD_REQUEST)

        uq.is_claimed = True
        uq.claimed_at = timezone.now()
        uq.save()

        # Award XP
        xp_result = request.user.add_xp(uq.quest.xp_reward)

        return Response({
            'message': f"Claimed {uq.quest.xp_reward} XP for '{uq.quest.title}'!",
            'xp_awarded': uq.quest.xp_reward,
            'total_xp': request.user.xp,
            'level': request.user.level,
            'rank_title': request.user.rank_title,
            'leveled_up': xp_result['leveled_up'],
            'quest_id': uq.id
        }, status=status.HTTP_200_OK)


class AchievementListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        initialize_user_gamification(request.user)
        all_achievements = Achievement.objects.all().order_by('id')
        user_unlocked = {
            ua.achievement_id: ua.unlocked_at
            for ua in UserAchievement.objects.filter(user=request.user)
        }

        results = []
        for ach in all_achievements:
            unlocked = ach.id in user_unlocked
            results.append({
                'id': ach.id,
                'code': ach.code,
                'title': ach.title,
                'description': ach.description,
                'badge_icon': ach.badge_icon,
                'xp_reward': ach.xp_reward,
                'requirement_type': ach.requirement_type,
                'target_value': ach.target_value,
                'is_unlocked': unlocked,
                'unlocked_at': user_unlocked.get(ach.id)
            })

        return Response(results, status=status.HTTP_200_OK)

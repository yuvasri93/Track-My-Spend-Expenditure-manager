from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from expenses.models import Expense, Budget
from expenses.gamification import process_gamification_on_expense, process_gamification_on_budget, initialize_user_gamification

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a pre-populated demo user with expenses and RPG progression'

    def handle(self, *args, **options):
        email = 'ranger@trackmyspend.com'
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'full_name': 'Alex Mercer',
            }
        )
        user.set_password('password123')
        user.save()

        initialize_user_gamification(user)

        today = date.today()
        current_month = today.strftime('%Y-%m')

        # Set monthly budget: ₹10,000
        Budget.objects.update_or_create(
            user=user,
            month=current_month,
            defaults={'amount': Decimal('10000.00')}
        )
        process_gamification_on_budget(user)

        # Remove existing demo expenses if any
        Expense.objects.filter(user=user).delete()

        demo_expenses = [
            {'desc': 'Weekly Grocery Haul', 'cat': 'Food', 'amount': '1850.00', 'method': 'UPI', 'days_ago': 6, 'notes': 'Fresh veggies, milk, staples'},
            {'desc': 'Metro Card Recharge', 'cat': 'Transport', 'amount': '500.00', 'method': 'Card', 'days_ago': 5, 'notes': 'Monthly commute pass'},
            {'desc': 'React Mastery Course', 'cat': 'Education', 'amount': '1200.00', 'method': 'Card', 'days_ago': 4, 'notes': 'Online coding tutorial'},
            {'desc': 'Electricity Bill', 'cat': 'Bills', 'amount': '1450.00', 'method': 'Bank Transfer', 'days_ago': 3, 'notes': 'August electricity statement'},
            {'desc': 'Weekend Dining Out', 'cat': 'Food', 'amount': '850.00', 'method': 'UPI', 'days_ago': 2, 'notes': 'Dinner with college friends'},
            {'desc': 'Pharmacy & Vitamins', 'cat': 'Health', 'amount': '400.00', 'method': 'Cash', 'days_ago': 1, 'notes': 'Multivitamins and first aid'},
            {'desc': 'Streaming Subscription', 'cat': 'Entertainment', 'amount': '299.00', 'method': 'UPI', 'days_ago': 0, 'notes': 'Monthly media streaming'},
        ]

        for item in demo_expenses:
            exp_date = today - timedelta(days=item['days_ago'])
            exp = Expense.objects.create(
                user=user,
                description=item['desc'],
                category=item['cat'],
                amount=Decimal(item['amount']),
                payment_method=item['method'],
                date=exp_date,
                notes=item['notes']
            )
            process_gamification_on_expense(user, exp)

        self.stdout.write(self.style.SUCCESS(
            f"Successfully created demo user '{user.email}' with password 'password123'!\n"
            f"Level: {user.level} | Rank: {user.rank_title} | Total XP: {user.xp} | Streak: {user.streak_days} days"
        ))

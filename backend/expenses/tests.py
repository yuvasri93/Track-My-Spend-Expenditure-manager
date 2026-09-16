from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from expenses.models import Expense, Budget, Quest, UserQuest, Achievement
from expenses.gamification import seed_gamification_data

User = get_user_model()


class TrackMySpendAPITests(APITestCase):
    def setUp(self):
        seed_gamification_data()
        self.user = User.objects.create_user(
            email='testhero@trackmyspend.com',
            full_name='Test Hero',
            password='secretpassword'
        )
        login_res = self.client.post('/api/auth/login/', {
            'email': 'testhero@trackmyspend.com',
            'password': 'secretpassword'
        })
        self.token = login_res.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_register_and_login(self):
        res = self.client.post('/api/auth/register/', {
            'full_name': 'New Adventurer',
            'email': 'newbie@example.com',
            'password': 'mypassword123',
            'confirm_password': 'mypassword123'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])

    def test_expense_crud(self):
        # 1. Create Expense
        create_res = self.client.post('/api/expenses/', {
            'description': 'Potion and Bread',
            'category': 'Food',
            'amount': '250.50',
            'date': '2026-09-16',
            'payment_method': 'UPI',
            'notes': 'Bought at local tavern'
        })
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        exp_id = create_res.data['expense']['id']
        self.assertEqual(create_res.data['expense']['description'], 'Potion and Bread')
        self.assertIn('gamification', create_res.data)

        # 2. List Expenses
        list_res = self.client.get('/api/expenses/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.data['count'], 1)
        self.assertEqual(list_res.data['total_amount'], 250.50)

        # 3. Retrieve Single Expense
        get_res = self.client.get(f'/api/expenses/{exp_id}/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data['category'], 'Food')

        # 4. Update Expense
        update_res = self.client.put(f'/api/expenses/{exp_id}/', {
            'description': 'Mega Potion and Feast',
            'amount': '350.00'
        })
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['expense']['description'], 'Mega Potion and Feast')
        self.assertEqual(float(update_res.data['expense']['amount']), 350.00)

        # 5. Delete Expense
        del_res = self.client.delete(f'/api/expenses/{exp_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

        # Confirm deleted
        check_res = self.client.get(f'/api/expenses/{exp_id}/')
        self.assertEqual(check_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_budget_and_dashboard(self):
        # Set monthly budget
        b_res = self.client.post('/api/budget/', {
            'month': '2026-09',
            'amount': '5000.00'
        })
        self.assertEqual(b_res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(b_res.data['budget']['amount']), 5000.00)

        # Add expense
        self.client.post('/api/expenses/', {
            'description': 'Shield repair',
            'category': 'Shopping',
            'amount': '1500.00',
            'date': '2026-09-10',
            'payment_method': 'Card'
        })

        # Check dashboard stats
        dash_res = self.client.get('/api/dashboard/stats/?month=2026-09')
        self.assertEqual(dash_res.status_code, status.HTTP_200_OK)
        self.assertEqual(dash_res.data['total_spent'], 1500.00)
        self.assertEqual(dash_res.data['monthly_budget'], 5000.00)
        self.assertEqual(dash_res.data['remaining'], 3500.00)
        self.assertFalse(dash_res.data['is_budget_exceeded'])

    def test_quests_and_achievements(self):
        # List quests
        q_res = self.client.get('/api/quests/')
        self.assertEqual(q_res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(q_res.data), 0)

        # List achievements
        a_res = self.client.get('/api/achievements/')
        self.assertEqual(a_res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(a_res.data), 0)

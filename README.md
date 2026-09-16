# TRACK MY SPEND

> **Track your spending. Complete your quests. Level up your financial life.**

A modern, full-stack personal expense management platform infused with lightweight RPG gamification mechanics. Developed with **Django REST Framework**, **MySQL**, and **React**.

---

## 🌟 Key Highlights & Features

### 💰 Core Expense Management (Full CRUD)
* **Create**: Add expenses with Amount, Description, Category, Date, Payment Method, and optional Notes.
* **Read**: Ledger table calculating totals dynamically with real-time statistics.
* **Update**: In-place modal editing with form pre-population, validation, and instantaneous state sync.
* **Delete**: Safe deletion with user confirmation and ledger total recalibration.
* **Search & Filter**: Search by keyword or description, filter by Category, Payment Method, and Date Range.
* **Multi-Attribute Sorting**: Sort by date (newest/oldest) and amount (highest/lowest).

### 🛡️ Monthly Budget & Risk Tracking
* **Monthly Budget Setting**: Set and adjust spending targets for any selected month.
* **Progress Tracking**: Real-time progress bar reflecting percentage of budget consumed.
* **Budget Exceeded Alert**: Immediate warning banner highlighting the exact amount exceeded beyond the allocated quota.
* **Category Breakdown**: Dynamic visualization of spending distribution across categories.

### 🎮 RPG Progression & Gamification
* **Character Card**: Shows current Level, RPG Rank Title, Total XP, Next Level Target, and XP Progress Bar.
* **XP Engine**:
  * Logging an expense: `+20 XP`
  * Setting a monthly budget: `+50 XP`
  * Claiming quests: `+30 XP` to `+120 XP`
  * Unlocking achievements: `+50 XP` to `+200 XP`
* **Rank Tiers**:
  * Level 1: *Coin Initiate*
  * Level 2: *Budget Novice*
  * Level 3: *Expense Scout*
  * Level 4: *Budget Ranger*
  * Level 5: *Thrift Warrior*
  * Level 6: *Savings Knight*
  * Level 7: *Finance Paladin*
  * Level 8+: *Wealth Master / Grand Fiscal Sage*
* **Daily Logging Streak**: Fire badge tracking unbroken days of financial management.
* **Financial Quests**: Daily, weekly, and milestone quests with live progress bars and claimable XP rewards.
* **Trophy Case Achievements**: Unlockable badges (*First Blood*, *The Architect*, *Iron Will*, *Decathlete*, etc.) with unlock timestamps.
* **Leaderboard**: Global rankings comparing adventurer levels, XP, and streaks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, React Router 7, Lucide Icons, Canvas Confetti, Vanilla CSS |
| **Backend** | Python 3, Django 5.x, Django REST Framework, SimpleJWT, PyMySQL, django-cors-headers |
| **Database** | MySQL 8.0 |
| **Architecture** | Decoupled RESTful Architecture with JWT Bearer Token Authentication |

---

## 📁 Project Structure

```
TrackMySpend/
├── README.md
├── .gitignore
├── .env.example
├── .env
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── config/
│   │   ├── __init__.py        # PyMySQL MySQLdb driver installation
│   │   ├── settings.py        # MySQL, DRF, JWT, and CORS setup
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── users/
│   │   ├── models.py          # Custom User with XP, Level, Rank, Streak
│   │   ├── managers.py        # CustomUserManager
│   │   ├── serializers.py
│   │   ├── views.py           # Register, Login, Profile, Leaderboard
│   │   ├── urls.py
│   │   └── admin.py
│   └── expenses/
│       ├── models.py          # Expense, Budget, Quest, Achievement
│       ├── serializers.py
│       ├── views.py           # Expense CRUD, Budget, DashboardStats, Quests
│       ├── urls.py
│       ├── gamification.py    # XP, Streak, and Quest evaluation engine
│       ├── tests.py           # Automated test suite
│       └── management/commands/
│           ├── seed_data.py   # Populates default quests and achievements
│           └── create_demo_user.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   ├── CharacterCard.jsx
        │   ├── BudgetCard.jsx
        │   ├── ExpenseTable.jsx
        │   ├── ExpenseModal.jsx
        │   ├── LevelUpModal.jsx
        │   ├── AchievementModal.jsx
        │   └── ToastNotification.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Expenses.jsx
        │   ├── AddExpense.jsx
        │   ├── Budget.jsx
        │   ├── Quests.jsx
        │   ├── Achievements.jsx
        │   ├── Profile.jsx
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── GamificationContext.jsx
        ├── services/
        │   └── api.js
        ├── utils/
        │   └── formatters.js
        └── styles/
            ├── variables.css
            ├── global.css
            ├── components.css
            └── pages.css
```

---

## 🚀 Quickstart & Setup Guide

### 1. Database Configuration (MySQL)
Ensure your MySQL server is running and create the database (or let Django connect):
```sql
CREATE DATABASE IF NOT EXISTS track_my_spend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update your `.env` file (or `backend/.env`):
```ini
DB_ENGINE=django.db.backends.mysql
DB_NAME=track_my_spend
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
SECRET_KEY=your_django_secret_key
DEBUG=True
```

---

### 2. Backend Setup & Run

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations on MySQL:
   ```bash
   python manage.py migrate
   ```

4. Seed initial Quests, Achievements, and Demo User:
   ```bash
   python manage.py seed_data
   python manage.py create_demo_user
   ```

5. Run the Django development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```

---

### 3. Frontend Setup & Run

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 🔑 Demo Account Credentials

| Attribute | Value |
| :--- | :--- |
| **Email** | `ranger@trackmyspend.com` |
| **Password** | `password123` |
| **RPG Rank** | Level 3 • Expense Scout |
| **Preloaded Data** | 7 realistic expenses, monthly budget, 7-day streak, active quests |

*You can also register a brand new user from the Register page at any time.*

---

## 📡 REST API Reference

All requests accept and return `application/json`. Authenticated routes require the header:
`Authorization: Bearer <jwt_access_token>`.

### Authentication
* `POST /api/auth/register/` - Create account (`full_name`, `email`, `password`, `confirm_password`)
* `POST /api/auth/login/` - Login (`email`, `password`) -> returns JWT tokens & user profile
* `POST /api/auth/refresh/` - Refresh expired access token
* `GET  /api/auth/profile/` - Get authenticated profile + RPG stats
* `PUT  /api/auth/profile/` - Update profile full name
* `GET  /api/auth/leaderboard/` - Top adventurers ranked by XP

### Expenses CRUD
* `GET    /api/expenses/` - Filtered & sorted expense list (`?search=`, `?category=`, `?payment_method=`, `?start_date=`, `?end_date=`, `?ordering=`)
* `POST   /api/expenses/` - Create new expense (triggers RPG XP, streak, quests, achievements)
* `GET    /api/expenses/<id>/` - Retrieve single expense
* `PUT    /api/expenses/<id>/` - Update expense
* `DELETE /api/expenses/<id>/` - Delete expense

### Budget & Dashboard
* `GET  /api/budget/?month=YYYY-MM` - Fetch budget for specific month
* `POST /api/budget/` - Create/Update budget (`month`, `amount`)
* `GET  /api/dashboard/stats/?month=YYYY-MM` - Monthly aggregates, remaining balance, avg daily, category breakdown, recent transactions

### Quests & Achievements
* `GET  /api/quests/` - List user quests with live progress
* `POST /api/quests/<id>/claim/` - Claim quest XP reward
* `GET  /api/achievements/` - List all badges (unlocked and locked)

---

## 🧪 Automated Testing

Run Django's test suite to verify all endpoints and MySQL persistence:
```bash
cd backend
python manage.py test expenses
```
Output:
```
Ran 4 tests in 4.102s
OK
```

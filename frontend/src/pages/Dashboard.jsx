import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  PieChart as PieIcon,
  PiggyBank,
  Receipt,
  CalendarDays,
  ArrowRight,
  Plus,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';
import CharacterCard from '../components/CharacterCard';
import BudgetCard from '../components/BudgetCard';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency, getCategoryMeta } from '../utils/formatters';

const Dashboard = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const { showToast } = useGamification();

  const fetchDashboardStats = async (month) => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats(month);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedMonth);
  }, [selectedMonth]);

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleDeleteExpense = async (expense) => {
    if (window.confirm(`Are you sure you want to delete "${expense.description}"?`)) {
      try {
        await api.expenses.delete(expense.id);
        showToast('Expense deleted successfully.', 'info');
        fetchDashboardStats(selectedMonth);
      } catch (err) {
        alert(err.message || 'Failed to delete expense.');
      }
    }
  };

  const handleExpenseUpdated = () => {
    fetchDashboardStats(selectedMonth);
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Command Center</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{stats?.character?.user_name || 'Adventurer'}</strong>. Here is your financial realm status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="month-picker-box">
            <CalendarDays size={18} color="var(--text-muted)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker-input"
            />
          </div>

          <button
            onClick={() => fetchDashboardStats(selectedMonth)}
            className="action-btn"
            title="Refresh statistics"
            style={{ width: '38px', height: '38px', background: 'var(--bg-surface)' }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Character Card (Gamification Level, Rank, XP Bar, Streak) */}
      <CharacterCard character={stats?.character} />

      {/* Financial Summary Cards */}
      <div className="summary-grid">
        <div className="card metric-card">
          <div className="metric-header">
            <span>Spent This Month</span>
            <div className="metric-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats?.total_spent || 0)}</div>
          <div className="metric-sub">Across all categories</div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span>Monthly Budget</span>
            <div className="metric-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <PieIcon size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats?.monthly_budget || 0)}</div>
          <div className="metric-sub">
            {stats?.budget_is_set ? 'Active monthly limit' : 'Limit not set yet'}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span>Remaining Funds</span>
            <div
              className="metric-icon-box"
              style={{
                background: stats?.is_budget_exceeded
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
                color: stats?.is_budget_exceeded ? '#f43f5e' : '#10b981',
              }}
            >
              <PiggyBank size={18} />
            </div>
          </div>
          <div
            className="metric-value"
            style={{ color: stats?.is_budget_exceeded ? '#f43f5e' : '#10b981' }}
          >
            {formatCurrency(stats?.remaining || 0)}
          </div>
          <div className="metric-sub">
            {stats?.is_budget_exceeded ? 'Budget exceeded!' : 'Left to spend this month'}
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span>Transactions</span>
            <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-value">{stats?.transactions_count || 0}</div>
          <div className="metric-sub">Logged in {selectedMonth}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span>Avg. Daily Spending</span>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats?.average_daily_spending || 0)}</div>
          <div className="metric-sub">Per day this month</div>
        </div>
      </div>

      {/* Budget Progress Card */}
      <BudgetCard
        monthlyBudget={stats?.monthly_budget || 0}
        totalSpent={stats?.total_spent || 0}
        remaining={stats?.remaining || 0}
        progressPercent={stats?.budget_progress_percent || 0}
        isBudgetExceeded={stats?.is_budget_exceeded || false}
        exceededAmount={stats?.exceeded_amount || 0}
        budgetIsSet={stats?.budget_is_set || false}
      />

      {/* Category Breakdown & Recent Expenses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem' }}>
        {/* Recent Expenses */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Recent Expenses</h3>
              <p style={{ fontSize: '0.85rem' }}>Latest financial activities</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/add-expense" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                <Plus size={15} />
                <span>Add Expense</span>
              </Link>
              <Link to="/expenses" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                <span>View All</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <ExpenseTable
            expenses={stats?.recent_expenses || []}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            isLoading={loading}
          />
        </div>

        {/* Category Breakdown Mini Widget */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Category Split</h3>
          <p style={{ fontSize: '0.85rem' }}>Monthly distribution</p>

          <div className="category-bars">
            {stats?.category_breakdown && stats.category_breakdown.length > 0 ? (
              stats.category_breakdown.map((cat) => {
                const meta = getCategoryMeta(cat.category);
                return (
                  <div key={cat.category} className="cat-bar-item">
                    <div className="cat-bar-labels">
                      <span style={{ color: 'var(--text-white)' }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${cat.percentage}%`,
                          backgroundColor: meta.color,
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No category data for {selectedMonth}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Modal */}
      <ExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onExpenseUpdated={handleExpenseUpdated}
      />
    </div>
  );
};

export default Dashboard;

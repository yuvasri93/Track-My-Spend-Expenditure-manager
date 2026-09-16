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
  Sparkles,
  Zap,
  Coffee,
  ShoppingBag,
  Bus,
  Utensils
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';
import CharacterCard from '../components/CharacterCard';
import BudgetCard from '../components/BudgetCard';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency, getCategoryMeta } from '../utils/formatters';

const QUICK_PRESETS = [
  { desc: 'Coffee / Tea', cat: 'Food', amt: '120.00', method: 'UPI', icon: Coffee },
  { desc: 'Quick Lunch', cat: 'Food', amt: '250.00', method: 'UPI', icon: Utensils },
  { desc: 'Metro / Auto Fare', cat: 'Transport', amt: '80.00', method: 'UPI', icon: Bus },
  { desc: 'Groceries / Snacks', cat: 'Food', amt: '450.00', method: 'Card', icon: ShoppingBag },
];

const Dashboard = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [quickLogging, setQuickLogging] = useState(false);
  const { handleGamificationEvent, showToast } = useGamification();

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

  const handleQuickLog = async (preset) => {
    try {
      setQuickLogging(true);
      const todayStr = new Date().toISOString().slice(0, 10);
      const res = await api.expenses.create({
        description: preset.desc,
        category: preset.cat,
        amount: preset.amt,
        date: todayStr,
        payment_method: preset.method,
        notes: 'Quick-logged from Command Center',
      });

      if (res.gamification) {
        handleGamificationEvent(res.gamification);
      }

      showToast(`Quick Logged "${preset.desc}"! +20 XP ⚡`, 'xp');
      fetchDashboardStats(selectedMonth);
    } catch (err) {
      alert(err.message || 'Failed to quick log.');
    } finally {
      setQuickLogging(false);
    }
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="month-picker-box">
            <CalendarDays size={17} color="var(--text-muted)" />
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
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* Character Card (Level, Rank, XP Bar, Streak) */}
      <CharacterCard character={stats?.character} />

      {/* 1-Click Quick Add Presets Bar (Fintech UX Delight!) */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-white)' }}>
            <Zap size={16} color="#fbbf24" />
            <span>1-Click Quick Log (+20 XP):</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap any preset to log instantly to MySQL</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          {QUICK_PRESETS.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                disabled={quickLogging}
                onClick={() => handleQuickLog(preset)}
                className="btn btn-secondary"
                style={{
                  padding: '0.55rem 0.85rem',
                  justifyContent: 'flex-start',
                  fontSize: '0.825rem',
                  gap: '0.6rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple-light)' }}>
                  <Icon size={14} />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>{preset.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>₹{preset.amt}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Metric Cards */}
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
            <span>Remaining Quota</span>
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
            {stats?.is_budget_exceeded ? 'Budget exceeded!' : 'Safe balance left'}
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
            <span>Avg. Daily Spend</span>
            <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats?.average_daily_spending || 0)}</div>
          <div className="metric-sub">Per day pace</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '1.5rem' }}>
        {/* Recent Expenses Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Recent Ledger Entries</h3>
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

        {/* Category Breakdown Widget */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Category Distribution</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Monthly outflows by category</p>

          <div className="category-bars">
            {stats?.category_breakdown && stats.category_breakdown.length > 0 ? (
              stats.category_breakdown.map((cat) => {
                const meta = getCategoryMeta(cat.category);
                return (
                  <div key={cat.category} className="cat-bar-item">
                    <div className="cat-bar-labels">
                      <span style={{ color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: meta.color }} />
                        {cat.category}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: '7px' }}>
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
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No category activity for {selectedMonth}.
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

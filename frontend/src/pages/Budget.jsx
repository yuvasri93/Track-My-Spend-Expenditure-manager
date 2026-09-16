import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Calendar,
  AlertTriangle,
  Sparkles,
  Save,
  CheckCircle2,
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';
import { formatCurrency, getCategoryMeta } from '../utils/formatters';

const PRESETS = [5000, 10000, 15000, 20000, 30000, 50000];

const Budget = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { handleGamificationEvent, showToast } = useGamification();

  const loadBudgetData = async (month) => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats(month);
      setStats(data);
      if (data.monthly_budget) {
        setBudgetAmount(data.monthly_budget);
      } else {
        setBudgetAmount('');
      }
    } catch (err) {
      console.error('Failed to load budget info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData(selectedMonth);
  }, [selectedMonth]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetAmount || Number(budgetAmount) <= 0) {
      setError('Please provide a budget amount greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const res = await api.budget.set({
        month: selectedMonth,
        amount: Number(budgetAmount).toFixed(2),
      });

      if (res.gamification) {
        handleGamificationEvent(res.gamification);
      }

      showToast('Budget configured successfully! 🛡️', 'success');
      setMessage('Budget limit successfully updated.');
      loadBudgetData(selectedMonth);
    } catch (err) {
      setError(err.message || 'Failed to update budget.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setBudgetAmount(preset);
  };

  const isExceeded = stats?.is_budget_exceeded || false;
  const progressPercent = stats?.budget_progress_percent || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Budget Control Chamber</h1>
          <p className="page-subtitle">Formulate spending thresholds, maintain fiscal discipline, and avoid deficits.</p>
        </div>

        <div className="month-picker-box">
          <Calendar size={18} color="var(--text-muted)" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-picker-input"
          />
        </div>
      </div>

      {/* Main Budget Progress Card */}
      <div className="card" style={{ borderColor: isExceeded ? 'rgba(244, 63, 94, 0.4)' : 'rgba(139, 92, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
              Spending Threshold for {selectedMonth}
            </h2>
            <p style={{ fontSize: '0.875rem' }}>
              {stats?.budget_is_set
                ? 'Your active budget parameter'
                : 'No budget established yet. Set one below to unlock achievements!'}
            </p>
          </div>

          <span
            className="badge"
            style={{
              background: isExceeded ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: isExceeded ? '#f43f5e' : '#10b981',
              border: `1px solid ${isExceeded ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
            }}
          >
            {isExceeded ? 'BUDGET EXCEEDED' : stats?.budget_is_set ? 'ON TRACK' : 'UNPLANNED'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div className="profile-stat-box">
            <div className="stat-box-lbl">Monthly Budget</div>
            <div className="stat-box-val">{formatCurrency(stats?.monthly_budget || 0)}</div>
          </div>

          <div className="profile-stat-box">
            <div className="stat-box-lbl">Actual Spent</div>
            <div className="stat-box-val" style={{ color: 'var(--accent-purple-light)' }}>
              {formatCurrency(stats?.total_spent || 0)}
            </div>
          </div>

          <div className="profile-stat-box">
            <div className="stat-box-lbl">Remaining</div>
            <div
              className="stat-box-val"
              style={{ color: isExceeded ? '#f43f5e' : '#10b981' }}
            >
              {formatCurrency(stats?.remaining || 0)}
            </div>
          </div>

          <div className="profile-stat-box">
            <div className="stat-box-lbl">Progress</div>
            <div className="stat-box-val">{progressPercent}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-track" style={{ height: '14px', marginBottom: '1.25rem' }}>
          <div
            className={`progress-fill ${isExceeded ? 'budget-exceeded' : ''}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        {/* Exceeded Notice */}
        {isExceeded && (
          <div className="budget-alert-exceeded">
            <AlertTriangle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
            <div>
              <div className="alert-title">Budget Exceeded</div>
              <div style={{ fontSize: '0.875rem' }}>
                You have spent <strong>{formatCurrency(stats?.exceeded_amount || 0)}</strong> beyond your
                allocated monthly limit of {formatCurrency(stats?.monthly_budget || 0)}.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Budget Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Set / Adjust Monthly Budget</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Define your target ceiling for {selectedMonth}. Setting your first budget awards the{' '}
          <strong>The Architect</strong> badge and bonus XP.
        </p>

        {message && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Monthly Target Amount (₹)</label>
            <input
              type="number"
              step="1"
              min="1"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 700 }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Quick Presets:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleSelectPreset(p)}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Lock In Budget'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category Spending Details */}
      {stats?.category_breakdown && stats.category_breakdown.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Category Expenditure</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Breakdown of your current outflows for {selectedMonth}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.category_breakdown.map((cat) => {
              const meta = getCategoryMeta(cat.category);
              return (
                <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: meta.color,
                        }}
                      />
                      <strong style={{ color: 'var(--text-white)' }}>{cat.category}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        ({cat.count} transactions)
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-white)' }}>{formatCurrency(cat.amount)}</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        ({cat.percentage}%)
                      </span>
                    </div>
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
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;

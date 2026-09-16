import React from 'react';
import { AlertTriangle, ShieldCheck, TrendingDown, Compass, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const BudgetCard = ({
  monthlyBudget = 0,
  totalSpent = 0,
  remaining = 0,
  progressPercent = 0,
  isBudgetExceeded = false,
  exceededAmount = 0,
  budgetIsSet = false,
}) => {
  // Calculate remaining days in the month for "Safe Daily Spending"
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());

  const safeDailySpend = !isBudgetExceeded && remaining > 0
    ? Math.round(remaining / daysRemaining)
    : 0;

  // Determine health zone
  const getZoneStatus = () => {
    if (isBudgetExceeded) return { label: 'Budget Exceeded', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
    if (!budgetIsSet) return { label: 'Unset', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
    if (progressPercent >= 90) return { label: 'Critical Zone (90%+)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
    if (progressPercent >= 70) return { label: 'Caution Zone (70%+)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'Healthy Pace', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const zone = getZoneStatus();

  return (
    <div className="card" style={{ marginBottom: '2rem', borderColor: isBudgetExceeded ? 'rgba(244, 63, 94, 0.4)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Monthly Budget Sentinel</span>
            <span
              className="badge"
              style={{
                background: zone.bg,
                color: zone.color,
                border: `1px solid ${zone.color}44`,
                fontSize: '0.725rem',
              }}
            >
              {zone.label}
            </span>
          </h3>
          <p style={{ fontSize: '0.85rem' }}>
            {budgetIsSet
              ? `Real-time tracking for ${daysRemaining} days remaining in this month`
              : 'No budget established yet. Define your limits in the Budget menu to gain RPG bonuses.'}
          </p>
        </div>

        {budgetIsSet && !isBudgetExceeded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Compass size={16} color="#10b981" />
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Safe Daily Cap: </span>
              <strong style={{ color: '#10b981' }}>{formatCurrency(safeDailySpend)}/day</strong>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div className="profile-stat-box" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allocated Budget</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-white)' }}>
            {formatCurrency(monthlyBudget)}
          </div>
        </div>

        <div className="profile-stat-box" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Outflow</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
            {formatCurrency(totalSpent)}
          </div>
        </div>

        <div className="profile-stat-box" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Quota</div>
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: isBudgetExceeded ? '#f43f5e' : '#10b981',
            }}
          >
            {formatCurrency(remaining)}
          </div>
        </div>

        <div className="profile-stat-box" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threshold Used</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-white)' }}>
            {monthlyBudget > 0 ? `${progressPercent}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Visual Progress Bar with Zone Colors */}
      <div className="progress-track" style={{ height: '14px', position: 'relative' }}>
        <div
          className={`progress-fill ${isBudgetExceeded ? 'budget-exceeded' : ''}`}
          style={{
            width: `${Math.min(100, progressPercent)}%`,
            background: isBudgetExceeded
              ? 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)'
              : progressPercent >= 90
              ? 'linear-gradient(90deg, #f59e0b 0%, #f43f5e 100%)'
              : progressPercent >= 70
              ? 'linear-gradient(90deg, #06b6d4 0%, #f59e0b 100%)'
              : 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #8b5cf6 100%)',
          }}
        />
      </div>

      {/* Exceeded Alert Notice */}
      {isBudgetExceeded && (
        <div className="budget-alert-exceeded">
          <AlertTriangle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <div className="alert-title">Budget Exceeded Warning!</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.15rem' }}>
              You have spent <strong>{formatCurrency(exceededAmount)}</strong> over your allocated monthly
              ceiling. We recommend locking non-essential spending until next month.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;

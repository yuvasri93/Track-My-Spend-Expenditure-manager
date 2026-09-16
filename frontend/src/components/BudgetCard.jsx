import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
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
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Budget Progress</h3>
          <p style={{ fontSize: '0.85rem' }}>
            {budgetIsSet
              ? 'Tracking your monthly expenditure threshold'
              : 'No budget set for this month yet. Go to Budget to set one!'}
          </p>
        </div>
        <span
          className="badge"
          style={{
            background: isBudgetExceeded
              ? 'rgba(244, 63, 94, 0.15)'
              : 'rgba(16, 185, 129, 0.15)',
            color: isBudgetExceeded ? '#f43f5e' : '#10b981',
            border: `1px solid ${isBudgetExceeded ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
          }}
        >
          {isBudgetExceeded ? 'Exceeded' : budgetIsSet ? 'Within Budget' : 'Not Set'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Budget</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)' }}>
            {formatCurrency(monthlyBudget)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spent</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
            {formatCurrency(totalSpent)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remaining</div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: isBudgetExceeded ? '#f43f5e' : '#10b981',
            }}
          >
            {formatCurrency(remaining)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)' }}>
            {monthlyBudget > 0 ? `${progressPercent}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="progress-track" style={{ height: '12px' }}>
        <div
          className={`progress-fill ${isBudgetExceeded ? 'budget-exceeded' : ''}`}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Exceeded Alert */}
      {isBudgetExceeded && (
        <div className="budget-alert-exceeded">
          <AlertTriangle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <div className="alert-title">Budget Exceeded!</div>
            <div style={{ fontSize: '0.85rem' }}>
              You have exceeded your monthly budget by{' '}
              <strong>{formatCurrency(exceededAmount)}</strong>. Consider curbing discretionary spending.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;

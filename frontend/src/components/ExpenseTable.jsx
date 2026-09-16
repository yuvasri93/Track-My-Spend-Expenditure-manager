import React from 'react';
import { Edit2, Trash2, Calendar, CreditCard, Tag } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryMeta, getPaymentMethodMeta } from '../utils/formatters';

const ExpenseTable = ({ expenses = [], onEdit, onDelete, isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading expenses...
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-card)',
        }}
      >
        <Tag size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-white)' }}>No expenses found</h4>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Record your transactions to start tracking spending and earning XP!
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const catMeta = getCategoryMeta(expense.category);
            const payMeta = getPaymentMethodMeta(expense.payment_method);

            return (
              <tr key={expense.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-white)' }}>
                    {expense.description}
                  </div>
                  {expense.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {expense.notes}
                    </div>
                  )}
                </td>
                <td>
                  <span
                    className="cat-pill"
                    style={{
                      background: catMeta.bg,
                      color: catMeta.color,
                      border: `1px solid ${catMeta.color}33`,
                    }}
                  >
                    {expense.category}
                  </span>
                </td>
                <td>
                  <span className="pay-pill">
                    {expense.payment_method}
                  </span>
                </td>
                <td>
                  <span className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEdit(expense)}
                      className="action-btn"
                      title="Edit expense"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="action-btn delete"
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;

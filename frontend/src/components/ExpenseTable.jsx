import React from 'react';
import {
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  Receipt,
  HeartPulse,
  Coins
} from 'lucide-react';
import { formatCurrency, formatDate, getCategoryMeta, getPaymentMethodMeta } from '../utils/formatters';

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'Utensils': return Utensils;
    case 'Car': return Car;
    case 'GraduationCap': return GraduationCap;
    case 'ShoppingBag': return ShoppingBag;
    case 'Gamepad2': return Gamepad2;
    case 'Receipt': return Receipt;
    case 'HeartPulse': return HeartPulse;
    default: return Coins;
  }
};

const ExpenseTable = ({ expenses = [], onEdit, onDelete, isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="skeleton"
            style={{ height: '48px', width: '100%', borderRadius: 'var(--radius-md)' }}
          />
        ))}
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
        <Tag size={42} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
        <h4 style={{ marginBottom: '0.4rem', color: 'var(--text-white)' }}>No transactions found</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Record your first expenditure to begin logging activity and leveling up.
        </p>
      </div>
    );
  }

  const tableTotal = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

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
            const CatIcon = getCategoryIcon(catMeta.icon);
            const payMeta = getPaymentMethodMeta(expense.payment_method);

            return (
              <tr key={expense.id}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.85rem' }}>{formatDate(expense.date)}</span>
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
                    <CatIcon size={12} />
                    <span>{expense.category}</span>
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
                      title="Edit expense record"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(expense)}
                      className="action-btn delete"
                      title="Delete expense record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid var(--border-card)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <td colSpan={4} style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Total for Listed Records ({expenses.length} transactions)
            </td>
            <td colSpan={2} style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent-purple-light)' }}>
              {formatCurrency(tableTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ExpenseTable;

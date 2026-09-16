import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkles,
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  Receipt,
  HeartPulse,
  Coins,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';

const CATEGORIES = [
  { name: 'Food', icon: Utensils, color: '#f97316' },
  { name: 'Transport', icon: Car, color: '#06b6d4' },
  { name: 'Education', icon: GraduationCap, color: '#3b82f6' },
  { name: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
  { name: 'Entertainment', icon: Gamepad2, color: '#a855f7' },
  { name: 'Bills', icon: Receipt, color: '#f43f5e' },
  { name: 'Health', icon: HeartPulse, color: '#10b981' },
  { name: 'Other', icon: Coins, color: '#94a3b8' },
];

const PAYMENT_METHODS = [
  { name: 'UPI', icon: Smartphone },
  { name: 'Card', icon: CreditCard },
  { name: 'Cash', icon: Banknote },
  { name: 'Bank Transfer', icon: Building2 },
  { name: 'Other', icon: Coins },
];

const AddExpense = () => {
  const navigate = useNavigate();
  const { handleGamificationEvent, showToast } = useGamification();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: todayStr,
    payment_method: 'UPI',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCategorySelect = (categoryName) => {
    setFormData((prev) => ({ ...prev, category: categoryName }));
  };

  const handlePaymentSelect = (methodName) => {
    setFormData((prev) => ({ ...prev, payment_method: methodName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for this expense.');
      return;
    }
    if (!formData.date) {
      setError('Please select a date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.expenses.create({
        amount: Number(formData.amount).toFixed(2),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
      });

      // Trigger gamification updates (Level Up, Streak, Quests)
      if (res.gamification) {
        handleGamificationEvent(res.gamification);
      }

      showToast(`Expense saved! +20 XP awarded!`, 'xp');
      navigate('/expenses');
    } catch (err) {
      setError(err.message || 'Failed to record expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Record Financial Move</h1>
          <p className="page-subtitle">Add an expense to update your ledger, maintain your streak, and earn XP.</p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.85rem',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '9999px',
            color: '#fbbf24',
            fontSize: '0.825rem',
            fontWeight: 700,
          }}
        >
          <Sparkles size={16} />
          <span>+20 XP on Record</span>
        </div>
      </div>

      <div className="card">
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f87171',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount and Description */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)' }}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Grocery store run, Bus pass, Pizza"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">Select Category</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? `${cat.color}22` : 'var(--bg-surface)',
                      border: `1.5px solid ${isSelected ? cat.color : 'var(--border-card)'}`,
                      color: isSelected ? 'var(--text-white)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={16} color={isSelected ? cat.color : 'var(--text-muted)'} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = formData.payment_method === pm.name;
                  return (
                    <button
                      type="button"
                      key={pm.name}
                      onClick={() => handlePaymentSelect(pm.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-surface)',
                        border: `1.5px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-card)'}`,
                        color: isSelected ? 'var(--text-white)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={16} color={isSelected ? 'var(--accent-purple-light)' : 'var(--text-muted)'} />
                      <span>{pm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Transaction</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional context, location, or remarks..."
              rows={3}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem' }}
            >
              <PlusCircle size={18} />
              <span>{loading ? 'Recording to Ledger...' : 'Record Expense (+20 XP)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;

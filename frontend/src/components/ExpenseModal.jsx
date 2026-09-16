import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';

const CATEGORIES = ['Food', 'Transport', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

const ExpenseModal = ({ isOpen, onClose, expense, onExpenseUpdated }) => {
  const { showToast } = useGamification();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: '',
    payment_method: 'UPI',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount || '',
        category: expense.category || 'Food',
        date: expense.date || '',
        payment_method: expense.payment_method || 'UPI',
        notes: expense.notes || '',
      });
      setError('');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!formData.date) {
      setError('Date is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.expenses.update(expense.id, {
        description: formData.description.trim(),
        amount: Number(formData.amount).toFixed(2),
        category: formData.category,
        date: formData.date,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
      });

      showToast('Expense updated successfully! ✨', 'success');
      if (onExpenseUpdated) {
        onExpenseUpdated(res.expense);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Edit Expense</h3>
          <button onClick={onClose} className="action-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="form-select"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="form-textarea"
                placeholder="Additional details..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;

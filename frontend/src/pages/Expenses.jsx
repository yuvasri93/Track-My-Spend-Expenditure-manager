import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Wallet,
  Receipt,
  RotateCcw,
  Download,
  X,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency, formatDate } from '../utils/formatters';

const CATEGORIES = ['All', 'Food', 'Transport', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];
const PAYMENT_METHODS = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ordering, setOrdering] = useState('-date');

  // Edit State
  const [editingExpense, setEditingExpense] = useState(null);

  const { showToast } = useGamification();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.expenses.list({
        search,
        category: category !== 'All' ? category : undefined,
        payment_method: paymentMethod !== 'All' ? paymentMethod : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        ordering,
      });
      setExpenses(res.results || []);
      setTotalAmount(res.total_amount || 0);
      setCount(res.count || 0);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, paymentMethod, startDate, endDate, ordering]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setPaymentMethod('All');
    setStartDate('');
    setEndDate('');
    setOrdering('-date');
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = async (expense) => {
    if (window.confirm(`Are you sure you want to delete "${expense.description}"?`)) {
      try {
        await api.expenses.delete(expense.id);
        showToast('Expense deleted from database.', 'info');
        fetchExpenses();
      } catch (err) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (!expenses.length) {
      alert('No expense records to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Description', 'Category', 'Payment Method', 'Amount (INR)', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.category,
      e.payment_method,
      e.amount,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TrackMySpend_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported expense ledger to CSV 📄', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Financial Ledger</h1>
          <p className="page-subtitle">Track, filter, audit, and export your personal transactions database.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            title="Export listed transactions as CSV spreadsheet"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>

          <Link to="/add-expense" className="btn btn-primary">
            <Plus size={18} />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, var(--bg-card) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtered Spend Total</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-white)' }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Matching Transactions</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
              {count}
            </div>
          </div>
        </div>

        <button onClick={handleResetFilters} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
          <RotateCcw size={15} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Category Pills Quick Filter Carousel */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="expenses-toolbar">
        <div className="filters-row">
          {/* Search Input with Clear Button */}
          <div className="search-input-box">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search descriptions, notes, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.875rem', padding: '0.6rem 2.2rem 0.6rem 2.4rem' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '145px', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                Method: {pm}
              </option>
            ))}
          </select>

          {/* Date range inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              title="Start Date"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
              title="End Date"
            />
          </div>

          {/* Sort By */}
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '155px', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="-date">Date (Newest First)</option>
            <option value="date">Date (Oldest First)</option>
            <option value="-amount">Amount (Highest First)</option>
            <option value="amount">Amount (Lowest First)</option>
          </select>
        </div>
      </div>

      {/* Expenses Table Card */}
      <div className="card">
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      </div>

      {/* Edit Modal */}
      <ExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onExpenseUpdated={() => fetchExpenses()}
      />
    </div>
  );
};

export default Expenses;

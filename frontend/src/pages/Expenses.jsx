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
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency } from '../utils/formatters';

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
    }, 300);
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
        showToast('Expense removed from ledger.', 'info');
        fetchExpenses();
      } catch (err) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>My Expense Ledger</h1>
          <p className="page-subtitle">Track, filter, and audit all recorded financial transactions</p>
        </div>

        <Link to="/add-expense" className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Expense</span>
        </Link>
      </div>

      {/* Summary Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, var(--bg-card) 100%)',
          borderColor: 'rgba(139, 92, 246, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtered Total Spend</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-white)' }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transactions Found</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
              {count}
            </div>
          </div>
        </div>

        <button onClick={handleResetFilters} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
          <RotateCcw size={16} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="expenses-toolbar">
        <div className="filters-row">
          {/* Search Input */}
          <div className="search-input-box">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search descriptions or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.875rem', padding: '0.6rem 1rem 0.6rem 2.4rem' }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '130px', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '140px', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
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
            <span style={{ color: 'var(--text-muted)' }}>to</span>
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
            style={{ width: 'auto', minWidth: '150px', padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
          >
            <option value="-date">Sort: Date (Newest)</option>
            <option value="date">Sort: Date (Oldest)</option>
            <option value="-amount">Sort: Amount (Highest)</option>
            <option value="amount">Sort: Amount (Lowest)</option>
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

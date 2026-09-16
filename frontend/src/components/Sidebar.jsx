import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  PieChart,
  Sword,
  Trophy,
  User,
  LogOut,
  Coins,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'My Expenses', icon: ReceiptText },
    { to: '/add-expense', label: 'Add Expense', icon: PlusCircle },
    { to: '/budget', label: 'Budget', icon: PieChart },
    { to: '/quests', label: 'Quests', icon: Sword },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Coins size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="brand-title">Track My Spend</div>
            <div className="brand-tagline">Level Up Your Finances</div>
          </div>
          {isOpen && (
            <button
              onClick={onClose}
              className="action-btn"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onClose && onClose()}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user-mini">
              <div className="user-avatar-mini">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info-mini">
                <div className="user-name-mini">{user.full_name || 'Adventurer'}</div>
                <div className="user-rank-mini">{user.rank_title || 'Coin Initiate'}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 1rem' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

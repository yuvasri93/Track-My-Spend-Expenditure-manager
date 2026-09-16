import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Flame, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn action-btn"
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div className="streak-pill" title="Current Daily Spending Streak">
              <Flame size={16} className="streak-flame" />
              <span>{user.streak_days || 0} Day Streak</span>
            </div>

            <div className="level-badge-nav" title="Current Level & Rank">
              <Zap size={15} />
              <span>Lvl {user.level || 1} • {user.rank_title || 'Initiate'}</span>
            </div>
          </>
        )}

        <Link to="/add-expense" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}>
          <Plus size={16} />
          <span>Add Expense</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

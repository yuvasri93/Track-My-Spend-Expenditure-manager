import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Flame, Zap, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user } = useAuth();
  const { isMuted, toggleSound } = useGamification();
  const { isDark, toggleTheme } = useTheme();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        </div>
      </div>

      <div className="navbar-right">
        {/* Theme Toggle Button (Light/Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="action-btn"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            transition: 'transform 0.2s ease',
          }}
        >
          {isDark ? (
            <Sun size={17} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #f59e0b)' }} />
          ) : (
            <Moon size={17} color="#7c3aed" />
          )}
        </button>

        {/* Sound FX Toggle Button */}
        <button
          onClick={toggleSound}
          className="action-btn"
          title={isMuted ? 'Unmute RPG Sound Effects' : 'Mute Sound Effects'}
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-surface)' }}
        >
          {isMuted ? <VolumeX size={16} color="var(--text-muted)" /> : <Volume2 size={16} color="var(--accent-purple-light)" />}
        </button>

        {user && (
          <>
            {/* Streak Counter Pill */}
            <div className="streak-pill" title={`${user.streak_days || 0} consecutive days of spending tracking!`}>
              <Flame size={16} className="streak-flame" />
              <span>{user.streak_days || 0}d Streak</span>
            </div>

            {/* Level & Rank Pill */}
            <Link
              to="/profile"
              className="level-badge-nav"
              title={`Level ${user.level || 1}: ${user.rank_title || 'Initiate'} • View Character Dossier`}
              style={{ textDecoration: 'none' }}
            >
              <Zap size={15} />
              <span>Lvl {user.level || 1} • {user.rank_title || 'Initiate'}</span>
            </Link>
          </>
        )}

        <Link
          to="/add-expense"
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

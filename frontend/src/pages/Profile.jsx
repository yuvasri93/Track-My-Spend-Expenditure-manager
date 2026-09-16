import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Flame,
  Zap,
  Award,
  Calendar,
  Mail,
  Edit3,
  Save,
  LogOut,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useGamification();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name);
    }
  }, [user]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.auth.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await api.auth.updateProfile({ full_name: name.trim() });
      updateUser({ full_name: name.trim() });
      setIsEditing(false);
      showToast('Profile name updated!', 'success');
    } catch (err) {
      alert(err.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tier = user?.tier_info || {
    min_xp: 0,
    max_xp: 200,
    progress_percent: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Adventurer Dossier</h1>
          <p className="page-subtitle">Inspect your RPG credentials, rank standing, and account details.</p>
        </div>

        <button onClick={handleLogout} className="btn btn-danger">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <div className="profile-grid">
        {/* Left Hero Card */}
        <div className="profile-card-hero">
          <div className="profile-avatar-large">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="profile-level-badge">
            <Zap size={15} />
            <span>LEVEL {user?.level || 1}</span>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--text-white)' }}>
            {user?.full_name || 'Adventurer'}
          </h2>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--accent-purple-light)',
              fontWeight: 600,
              fontSize: '0.95rem',
              marginBottom: '1.25rem',
            }}
          >
            <Shield size={16} />
            <span>{user?.rank_title || 'Coin Initiate'}</span>
          </div>

          {/* XP Progress */}
          <div style={{ width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Experience Points</span>
              <span style={{ color: 'var(--accent-purple-light)' }}>
                {user?.xp || 0} / {tier.max_xp} XP
              </span>
            </div>
            <div className="progress-track" style={{ height: '10px' }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, Math.max(tier.progress_percent, 5))}%` }}
              />
            </div>
          </div>

          {/* Mini stats */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="stat-box-lbl">Logging Streak</div>
              <div className="stat-box-val" style={{ color: '#f59e0b' }}>
                <Flame size={18} style={{ display: 'inline', marginRight: '4px' }} />
                {user?.streak_days || 0}d
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="stat-box-lbl">Total Level</div>
              <div className="stat-box-val" style={{ color: 'var(--accent-purple-light)' }}>
                Lvl {user?.level || 1}
              </div>
            </div>
          </div>
        </div>

        {/* Right Information & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Account Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">
                  <Mail size={15} />
                  <span>Email Address</span>
                </label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label className="form-label">
                  <User size={15} />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <form onSubmit={handleUpdateName} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      required
                    />
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      <Save size={16} />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.full_name || '');
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{user?.full_name}</span>
                    <button onClick={() => setIsEditing(true)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">
                  <Calendar size={15} />
                  <span>Enlisted On</span>
                </label>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {formatDate(user?.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Standings Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Trophy size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Adventurers Leaderboard</h3>
            </div>

            <div className="table-responsive">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Adventurer</th>
                    <th>Level & Title</th>
                    <th>Streak</th>
                    <th style={{ textAlign: 'right' }}>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player) => (
                    <tr
                      key={player.rank}
                      style={{
                        background: player.is_current_user ? 'rgba(139, 92, 246, 0.1)' : undefined,
                        borderLeft: player.is_current_user ? '3px solid var(--accent-purple)' : undefined,
                      }}
                    >
                      <td>
                        <strong style={{ color: player.rank === 1 ? '#fbbf24' : player.rank === 2 ? '#94a3b8' : player.rank === 3 ? '#b45309' : 'var(--text-muted)' }}>
                          #{player.rank}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-white)' }}>{player.full_name}</strong>
                        {player.is_current_user && (
                          <span className="badge" style={{ marginLeft: '0.5rem', background: 'var(--accent-purple)', color: 'white', fontSize: '0.65rem' }}>
                            YOU
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple-light)' }}>
                          Lvl {player.level} • {player.rank_title}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                          🔥 {player.streak_days}d
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-white)' }}>
                        {player.xp} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

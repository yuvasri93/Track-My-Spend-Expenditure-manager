import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Flame,
  Zap,
  CheckCircle,
  BookOpen,
  Compass,
  PieChart,
  CreditCard,
  Lock,
  Award,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

const getBadgeIcon = (iconName) => {
  switch (iconName) {
    case 'sparkles': return Sparkles;
    case 'flame': return Flame;
    case 'zap': return Zap;
    case 'check-circle': return CheckCircle;
    case 'book-open': return BookOpen;
    case 'compass': return Compass;
    case 'pie-chart': return PieChart;
    case 'credit-card': return CreditCard;
    default: return Trophy;
  }
};

const getRarity = (xp) => {
  if (xp >= 150) return { label: 'Legendary', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  if (xp >= 100) return { label: 'Epic', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
  if (xp >= 70) return { label: 'Rare', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' };
  return { label: 'Common', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const data = await api.achievements.list();
      setAchievements(data);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filtered = achievements.filter((ach) => {
    if (filter === 'UNLOCKED') return ach.is_unlocked;
    if (filter === 'LOCKED') return !ach.is_unlocked;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Hall of Achievements</h1>
          <p className="page-subtitle">
            Permanent accolades unlocked through sound financial management, milestones, and streaks.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 1rem',
            background: 'rgba(139, 92, 246, 0.18)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '9999px',
            color: 'var(--accent-purple-light)',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <Award size={18} />
          <span>{unlockedCount} of {totalCount} Badges Unlocked</span>
        </div>
      </div>

      {/* Progress banner */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)' }}>
              Overall Trophy Progression
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
              ({unlockedCount}/{totalCount} Completed)
            </span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
            {progressPercent}%
          </span>
        </div>
        <div className="progress-track" style={{ height: '10px' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'ALL', label: `All Badges (${totalCount})` },
          { key: 'UNLOCKED', label: `Unlocked (${unlockedCount})` },
          { key: 'LOCKED', label: `Locked (${totalCount - unlockedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`btn ${filter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : (
        <div className="achievements-grid">
          {filtered.map((ach) => {
            const Icon = getBadgeIcon(ach.badge_icon);
            const isUnlocked = ach.is_unlocked;
            const rarity = getRarity(ach.xp_reward);

            return (
              <div
                key={ach.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{
                  borderColor: isUnlocked ? `${rarity.color}66` : undefined,
                }}
              >
                {/* Rarity Pill */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <span
                    className="badge"
                    style={{
                      background: rarity.bg,
                      color: rarity.color,
                      fontSize: '0.65rem',
                    }}
                  >
                    {rarity.label}
                  </span>
                </div>

                <div
                  className="achievement-badge-icon"
                  style={{
                    borderColor: isUnlocked ? rarity.color : undefined,
                    boxShadow: isUnlocked ? `0 0 25px ${rarity.color}55` : undefined,
                  }}
                >
                  {isUnlocked ? <Icon size={30} color={rarity.color} /> : <Lock size={26} />}
                </div>

                <div className="achievement-name">{ach.title}</div>
                <div className="achievement-desc">{ach.description}</div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      color: isUnlocked ? '#fbbf24' : 'var(--text-muted)',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>+{ach.xp_reward} XP</span>
                  </div>

                  {isUnlocked ? (
                    <span className="achievement-status-tag status-unlocked">
                      Unlocked {ach.unlocked_at ? formatDate(ach.unlocked_at) : 'Achieved'}
                    </span>
                  ) : (
                    <span className="achievement-status-tag status-locked">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achievements;

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
  Award
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

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Hall of Achievements</h1>
          <p className="page-subtitle">
            Permanent accolades unlocked through sound financial management and unbroken streaks.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 1rem',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
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
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Trophy Completion</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
            {progressPercent}%
          </span>
        </div>
        <div className="progress-track" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your achievements trophy case...
        </div>
      ) : (
        <div className="achievements-grid">
          {achievements.map((ach) => {
            const Icon = getBadgeIcon(ach.badge_icon);
            const isUnlocked = ach.is_unlocked;

            return (
              <div
                key={ach.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-badge-icon">
                  {isUnlocked ? <Icon size={30} /> : <Lock size={26} />}
                </div>

                <div className="achievement-name">{ach.title}</div>
                <div className="achievement-desc">{ach.description}</div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isUnlocked ? '#fbbf24' : 'var(--text-muted)',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>+{ach.xp_reward} XP</span>
                  </div>

                  {isUnlocked ? (
                    <span className="achievement-status-tag status-unlocked">
                      Unlocked {ach.unlocked_at ? formatDate(ach.unlocked_at) : 'Earned'}
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

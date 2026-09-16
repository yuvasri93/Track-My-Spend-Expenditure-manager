import React from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const AchievementModal = () => {
  const { newAchievement, closeAchievementModal } = useGamification();

  if (!newAchievement) return null;

  return (
    <div className="modal-overlay" onClick={closeAchievementModal}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          padding: '2.5rem 2rem',
          background: 'linear-gradient(180deg, #2e1065 0%, var(--bg-card) 100%)',
          border: '2px solid #f59e0b',
          boxShadow: '0 0 45px rgba(245, 158, 11, 0.4)',
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
          }}
        >
          <Trophy size={40} color="#ffffff" />
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#fbbf24',
            marginBottom: '0.5rem',
          }}
        >
          Achievement Unlocked!
        </div>

        <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: '#ffffff' }}>
          {newAchievement.title}
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {newAchievement.description}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            color: '#fbbf24',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: '1.75rem',
          }}
        >
          <Sparkles size={16} />
          <span>+{newAchievement.xp_reward} XP Rewarded</span>
        </div>

        <button
          onClick={closeAchievementModal}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem 1.5rem' }}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default AchievementModal;

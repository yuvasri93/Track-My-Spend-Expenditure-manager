import React from 'react';
import { Award, Sparkles, ChevronRight } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const LevelUpModal = () => {
  const { levelUpData, closeLevelUpModal } = useGamification();

  if (!levelUpData) return null;

  return (
    <div className="modal-overlay" onClick={closeLevelUpModal}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          textAlign: 'center',
          padding: '2.5rem 2rem',
          background: 'linear-gradient(180deg, #1e1b4b 0%, var(--bg-card) 100%)',
          border: '2px solid var(--accent-purple)',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.5)',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
          }}
        >
          <Award size={48} color="#ffffff" />
        </div>

        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#fbbf24',
            marginBottom: '0.5rem',
          }}
        >
          Level Up Attained!
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffffff' }}>
          Level {levelUpData.level}
        </h2>

        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--accent-purple-light)',
            marginBottom: '1.25rem',
          }}
        >
          {levelUpData.rank_title}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Your financial discipline is ascending. Keep tracking daily expenses and fulfilling quests
          to unlock higher ranks!
        </p>

        <button
          onClick={closeLevelUpModal}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem 1.5rem', fontSize: '1rem' }}
        >
          <span>Continue Adventure</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;

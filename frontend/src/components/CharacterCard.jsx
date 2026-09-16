import React from 'react';
import { Flame, Shield, Award, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const getTierGradient = (level) => {
  if (level >= 9) return 'var(--tier-diamond)';
  if (level >= 7) return 'var(--tier-platinum)';
  if (level >= 5) return 'var(--tier-gold)';
  if (level >= 3) return 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)';
  return 'var(--tier-bronze)';
};

const CharacterCard = ({ character }) => {
  if (!character) return null;

  const {
    user_name,
    level = 1,
    rank_title = 'Coin Initiate',
    xp = 0,
    min_xp = 0,
    max_xp = 200,
    progress_percent = 0,
    streak_days = 0,
  } = character;

  const xpRemaining = Math.max(0, max_xp - xp);
  const avatarGradient = getTierGradient(level);

  return (
    <div className="card character-card">
      <div className="char-header">
        <div className="char-identity">
          <div
            className="char-avatar-box"
            style={{ background: avatarGradient }}
          >
            <span>{user_name ? user_name.charAt(0).toUpperCase() : 'U'}</span>
            <div className="char-level-tag">LVL {level}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="char-name">{user_name}</div>
              <span
                className="badge"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: 'var(--accent-purple-light)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                }}
              >
                TIER {Math.ceil(level / 2)}
              </span>
            </div>
            <div className="char-rank">
              <Shield size={15} color="var(--accent-purple-light)" />
              <span>{rank_title}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="char-streak-badge" title="Consecutive days of logging expenses">
            <Flame size={20} className="streak-flame" />
            <span>{streak_days} Day Streak</span>
            {streak_days >= 3 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  color: '#fef08a',
                  fontWeight: 800,
                }}
              >
                {streak_days >= 7 ? '1.5x XP' : '1.2x XP'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="xp-progress-section">
        <div className="xp-labels">
          <span className="xp-total">
            <Sparkles size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} color="#fbbf24" />
            <strong style={{ color: 'var(--text-white)' }}>{xp} XP</strong> / {max_xp} XP
          </span>
          <span className="xp-val">
            {xpRemaining > 0 ? `${xpRemaining} XP to Next Tier` : 'Maximum Tier Reached!'} ({progress_percent}%)
          </span>
        </div>
        <div className="progress-track" title={`${progress_percent}% to Next Level`}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.max(progress_percent, 5))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;

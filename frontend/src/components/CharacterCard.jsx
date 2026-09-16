import React from 'react';
import { Flame, Shield, Award, Sparkles } from 'lucide-react';

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

  return (
    <div className="card character-card">
      <div className="char-header">
        <div className="char-identity">
          <div className="char-avatar-box">
            <span>{user_name ? user_name.charAt(0).toUpperCase() : 'U'}</span>
            <div className="char-level-tag">LVL {level}</div>
          </div>
          <div>
            <div className="char-name">{user_name}</div>
            <div className="char-rank">
              <Shield size={15} color="var(--accent-purple-light)" />
              <span>{rank_title}</span>
            </div>
          </div>
        </div>

        <div className="char-streak-badge" title="Daily Expense Tracking Streak">
          <Flame size={20} className="streak-flame" />
          <span>{streak_days} Day Streak</span>
        </div>
      </div>

      <div className="xp-progress-section">
        <div className="xp-labels">
          <span className="xp-total">
            <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            XP Progress
          </span>
          <span className="xp-val">
            {xp} XP / {max_xp} XP
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

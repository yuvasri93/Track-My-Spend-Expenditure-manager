import React, { useState, useEffect } from 'react';
import {
  Sword,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  Crown,
  Grid,
  Shield,
  Gift,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useGamification } from '../context/GamificationContext';

const getQuestIcon = (iconName) => {
  switch (iconName) {
    case 'zap': return Zap;
    case 'calendar': return Calendar;
    case 'grid': return Grid;
    case 'shield': return Shield;
    case 'crown': return Crown;
    case 'sword': return Sword;
    default: return Target;
  }
};

const Quests = () => {
  const [userQuests, setUserQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [claimingId, setClaimingId] = useState(null);

  const { handleGamificationEvent, showToast } = useGamification();

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await api.quests.list();
      setUserQuests(data);
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleClaimQuest = async (questItem) => {
    try {
      setClaimingId(questItem.id);
      const res = await api.quests.claim(questItem.id);

      handleGamificationEvent({
        xp_awarded: res.xp_awarded,
        current_xp: res.total_xp,
        level: res.level,
        rank_title: res.rank_title,
        leveled_up: res.leveled_up,
      });

      showToast(`Claimed +${res.xp_awarded} XP for ${questItem.quest.title}! 🏆`, 'xp');
      fetchQuests();
    } catch (err) {
      alert(err.message || 'Failed to claim reward.');
    } finally {
      setClaimingId(null);
    }
  };

  const completedUnclaimedCount = userQuests.filter(
    (uq) => uq.is_completed && !uq.is_claimed
  ).length;

  const filteredQuests = userQuests.filter((uq) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'CLAIMABLE') return uq.is_completed && !uq.is_claimed;
    if (filterType === 'CLAIMED') return uq.is_claimed;
    return uq.quest.quest_type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Financial Quests & Bounties</h1>
          <p className="page-subtitle">
            Complete spending challenges, maintain your discipline, and claim high-value XP bounties.
          </p>
        </div>

        {completedUnclaimedCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 1rem',
              background: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '9999px',
              color: '#fbbf24',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Gift size={16} />
            <span>{completedUnclaimedCount} Quests Ready to Claim!</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Quests' },
          { key: 'CLAIMABLE', label: `Ready to Claim (${completedUnclaimedCount})` },
          { key: 'DAILY', label: 'Daily Quests' },
          { key: 'WEEKLY', label: 'Weekly Quests' },
          { key: 'MILESTONE', label: 'Milestones' },
          { key: 'CLAIMED', label: 'Completed History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`btn ${filterType === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '180px' }} />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No quests matching this filter category.</p>
        </div>
      ) : (
        <div className="quests-grid">
          {filteredQuests.map((uq) => {
            const Icon = getQuestIcon(uq.quest.icon);
            const isCompleted = uq.is_completed;
            const isClaimed = uq.is_claimed;
            const canClaim = isCompleted && !isClaimed;

            return (
              <div
                key={uq.id}
                className={`quest-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}
                style={{
                  borderColor: canClaim ? 'rgba(245, 158, 11, 0.5)' : undefined,
                  boxShadow: canClaim ? '0 0 25px rgba(245, 158, 11, 0.25)' : undefined,
                }}
              >
                <div>
                  <div className="quest-top">
                    <div
                      className="quest-icon-wrapper"
                      style={{
                        background: canClaim ? 'rgba(245, 158, 11, 0.18)' : undefined,
                        borderColor: canClaim ? 'rgba(245, 158, 11, 0.4)' : undefined,
                        color: canClaim ? '#fbbf24' : undefined,
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="quest-title">{uq.quest.title}</div>
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.65rem',
                          }}
                        >
                          {uq.quest.quest_type}
                        </span>
                      </div>
                      <div className="quest-desc">{uq.quest.description}</div>
                      <div className="quest-bounty-badge">
                        <Sparkles size={13} />
                        <span>+{uq.quest.xp_reward} XP Reward</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Challenge Progress</span>
                      <span style={{ fontWeight: 700, color: isCompleted ? '#10b981' : 'var(--text-white)' }}>
                        {uq.current_count} / {uq.quest.target_count}
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: '8px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${uq.progress_percent}%`,
                          background: isCompleted
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : undefined,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="quest-bottom">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {isClaimed
                      ? 'Reward Collected'
                      : isCompleted
                      ? 'Objective Achieved!'
                      : 'In Progress'}
                  </div>

                  {canClaim ? (
                    <button
                      onClick={() => handleClaimQuest(uq)}
                      disabled={claimingId === uq.id}
                      className="btn btn-primary"
                      style={{
                        padding: '0.5rem 1.15rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
                      }}
                    >
                      <Sparkles size={15} />
                      <span>{claimingId === uq.id ? 'Claiming...' : 'Claim XP'}</span>
                    </button>
                  ) : isClaimed ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <CheckCircle2 size={15} color="#10b981" />
                      <span>Claimed</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      Keep tracking
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

export default Quests;

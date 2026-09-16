import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { updateUser } = useAuth();
  const [levelUpData, setLevelUpData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      });
    } catch (e) {
      // Confetti fallback
    }
  };

  const showToast = (message, type = 'xp') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGamificationEvent = (gamification) => {
    if (!gamification) return;

    // Update user stats in context
    if (gamification.current_xp !== undefined || gamification.total_xp !== undefined) {
      updateUser({
        xp: gamification.current_xp ?? gamification.total_xp,
        level: gamification.level,
        rank_title: gamification.rank_title,
        streak_days: gamification.streak_days,
      });
    }

    // Check for level up
    if (gamification.leveled_up) {
      fireConfetti();
      setLevelUpData({
        level: gamification.level,
        rank_title: gamification.rank_title,
      });
    }

    // Check for new achievements
    if (gamification.unlocked_achievements && gamification.unlocked_achievements.length > 0) {
      const first = gamification.unlocked_achievements[0];
      setNewAchievement(first);
      fireConfetti();
    } else if (gamification.xp_awarded) {
      showToast(`+${gamification.xp_awarded} XP Earned! ⚡`, 'xp');
    }
  };

  const closeLevelUpModal = () => setLevelUpData(null);
  const closeAchievementModal = () => setNewAchievement(null);

  return (
    <GamificationContext.Provider
      value={{
        handleGamificationEvent,
        showToast,
        levelUpData,
        closeLevelUpModal,
        newAchievement,
        closeAchievementModal,
        toastMessage,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

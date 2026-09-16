import React from 'react';
import { Sparkles, CheckCircle, Info } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';

const ToastNotification = () => {
  const { toastMessage } = useGamification();

  if (!toastMessage) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        {toastMessage.type === 'xp' ? (
          <Sparkles size={18} color="#fbbf24" />
        ) : (
          <CheckCircle size={18} color="#10b981" />
        )}
        <span>{toastMessage.message}</span>
      </div>
    </div>
  );
};

export default ToastNotification;

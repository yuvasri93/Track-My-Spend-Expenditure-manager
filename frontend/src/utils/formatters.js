// Utility formatters for Track My Spend

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const getCategoryMeta = (category) => {
  const map = {
    Food: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', icon: 'Utensils' },
    Transport: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', icon: 'Car' },
    Education: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: 'GraduationCap' },
    Shopping: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', icon: 'ShoppingBag' },
    Entertainment: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', icon: 'Gamepad2' },
    Bills: { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', icon: 'Receipt' },
    Health: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'HeartPulse' },
    Other: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: 'Coins' },
  };
  return map[category] || map['Other'];
};

export const getPaymentMethodMeta = (method) => {
  const map = {
    UPI: { color: '#8b5cf6', label: 'UPI' },
    Card: { color: '#6366f1', label: 'Card' },
    Cash: { color: '#10b981', label: 'Cash' },
    'Bank Transfer': { color: '#0ea5e9', label: 'Bank Transfer' },
    Other: { color: '#64748b', label: 'Other' },
  };
  return map[method] || { color: '#64748b', label: method };
};

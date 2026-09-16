// API service for Track My Spend

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // If unauthorized and we had a token, remove it
      if (token && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || data.message || Object.values(data)[0] || 'An error occurred';
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login/', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register/', { method: 'POST', body: JSON.stringify(userData) }),
    getProfile: () => request('/auth/profile/'),
    updateProfile: (data) => request('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
    getLeaderboard: () => request('/auth/leaderboard/'),
  },
  expenses: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const queryString = query.toString();
      return request(`/expenses/${queryString ? `?${queryString}` : ''}`);
    },
    get: (id) => request(`/expenses/${id}/`),
    create: (data) => request('/expenses/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/expenses/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/expenses/${id}/`, { method: 'DELETE' }),
  },
  budget: {
    get: (month) => request(`/budget/${month ? `?month=${month}` : ''}`),
    set: (data) => request('/budget/', { method: 'POST', body: JSON.stringify(data) }),
  },
  dashboard: {
    getStats: (month) => request(`/dashboard/stats/${month ? `?month=${month}` : ''}`),
  },
  quests: {
    list: () => request('/quests/'),
    claim: (id) => request(`/quests/${id}/claim/`, { method: 'POST' }),
  },
  achievements: {
    list: () => request('/achievements/'),
  },
};

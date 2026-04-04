const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('admin_token');

// Helper for API calls - cookies are used automatically, but we still support Authorization header
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include', // ← Send cookies automatically
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  // Auth
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // ← Include cookies
      });
      return res.json();
    },
    verify: async () => {
      // No token needed - backend reads from cookie
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.json();
    },
    logout: async () => {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.json();
    },
  },

  // Studios
  studios: {
    getAll: async () => {
      return fetchWithAuth('/studios');
    },
    getById: async (id: string) => {
      return fetchWithAuth(`/studios/${id}`);
    },
    create: async (data: any) => {
      return fetchWithAuth('/studios', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchWithAuth(`/studios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/studios/${id}`, { method: 'DELETE' });
    },
    toggle: async (id: string) => {
      return fetchWithAuth(`/studios/${id}/toggle`, { method: 'POST' });
    },
  },

  // Bookings
  bookings: {
    getAll: async (params?: { status?: string; studio_id?: string; page?: number; limit?: number }) => {
      const url = new URL(`${API_BASE}/admin/bookings`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) url.searchParams.append(key, String(value));
        });
      }
      const token = getToken();
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string) => {
      return fetchWithAuth(`/admin/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/admin/bookings/${id}`, { method: 'DELETE' });
    },
    getStats: async () => {
      return fetchWithAuth('/admin/bookings/stats/overview');
    },
  },

  // Enquiries
  enquiries: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const url = new URL(`${API_BASE}/enquiries`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) url.searchParams.append(key, String(value));
        });
      }
      return fetch(url.toString()).then(res => res.json()); // Public endpoint
    },
    updateStatus: async (id: string, status: string) => {
      return fetchWithAuth(`/enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/enquiries/${id}`, { method: 'DELETE' });
    },
  },

  // Content
  content: {
    getAll: async () => {
      return fetch(`${API_BASE}/content`).then(res => res.json());
    },
    getByType: async (type: string) => {
      return fetch(`${API_BASE}/content/${type}`).then(res => res.json());
    },
    update: async (type: string, data: any) => {
      return fetchWithAuth(`/content/${type}`, {
        method: 'PUT',
        body: JSON.stringify({ data }),
      });
    },
  },
};

export default api;

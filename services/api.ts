const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'http://localhost:3001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('admin_token');

// Helper for API calls
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Token-based auth (localStorage) is deprecated - using cookies now
  // Still support token for backward compatibility during transition
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Send cookies (auth_token) automatically
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, use text or default message
      const text = await response.text();
      errorData = { error: text || 'Request failed' };
    }
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }

  return response.json();
};

// ==================== TYPE DEFINITIONS ====================

export interface PricingPreview {
  total: number;
  currency: string;
  snapshot?: {
    applied_rule_id?: string;
    base_price?: number;
    duration_hours?: number;
  };
}

export interface BookingHoldResponse {
  lock_token: string;
  expires_at: string;
  pricing_preview: PricingPreview;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  price: {
    base: number;
    total: number;
    currency: string;
  };
  is_available: boolean;
}

export interface AvailabilityRange {
  start: string;
  end: string;
}

export interface BookingConfirmResponse {
  booking_id: string;
  status: string;
  email_status: string;
}

export interface UserDetailsInput {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  special_requirements?: string;
}

export interface StudioOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  priceNote: string;
  image: string;
  features: string[];
}

// ==================== API OBJECT ====================

export const api = {
  // Auth
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Receive httpOnly cookie
      });
      return res.json();
    },
    verify: async () => {
      // Verify using cookie or token (no token needed, server reads cookie)
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        credentials: 'include', // Send cookie if exists
      });
      const data = await res.json().catch(() => ({ valid: false }));
      return data;
    },
    logout: async () => {
      // Backend will clear the cookie
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      // Clean up localStorage
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      return res.json();
    },
    getMe: async () => {
      // Get current user profile and bookings
      const res = await fetch(`${API_BASE}/users/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Not authenticated');
      }
      return res.json();
    },
  },

  // User (customer) auth
  user: {
    register: async (full_name: string, email: string, phone: string, password: string) => {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, phone, password }),
        credentials: 'include',
      });
      return res.json();
    },
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      return res.json();
    },
    logout: async () => {
      const res = await fetch(`${API_BASE}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.json();
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/users/me`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
  },


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
    getPrice: async (studioId: string, startDatetime: string, endDatetime: string) => {
      const url = new URL(`${API_BASE}/studios/${studioId}/price`);
      url.searchParams.append('start_datetime', startDatetime);
      url.searchParams.append('end_datetime', endDatetime);
      const res = await fetch(url.toString());
      return res.json();
    },
  },

  projects: {
    getAll: async () => {
      return fetchWithAuth('/projects');
    },
    create: async (data: any) => {
      return fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchWithAuth(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchWithAuth(`/projects/${id}`, { method: 'DELETE' });
    },
    toggle: async (id: string) => {
      return fetchWithAuth(`/projects/${id}/toggle`, { method: 'POST' });
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
      return fetchWithAuth(`/admin/bookings?${url.searchParams.toString()}`);
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

    // Public booking endpoints (no auth required)
    hold: async (studioId: string, startDatetime: string, endDatetime: string): Promise<BookingHoldResponse> => {
      const res = await fetch(`${API_BASE}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studio_id: studioId, start_datetime: startDatetime, end_datetime: endDatetime }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create hold');
      }
      return res.json();
    },

    confirm: async (lockToken: string, paymentIntentId: string, finalPrice: number, user_details: UserDetailsInput): Promise<BookingConfirmResponse> => {
      const res = await fetch(`${API_BASE}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lock_token: lockToken,
          payment_intent_id: paymentIntentId,
          final_price: finalPrice,
          user_details
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to confirm booking');
      }
      return res.json();
    },
  },

  // Enquiries
  enquiries: {
    getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
      const url = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) url.append(key, String(value));
        });
      }
      return fetchWithAuth(`/enquiries?${url.toString()}`);
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

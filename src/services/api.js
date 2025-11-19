// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('auth_token'); }
export function setToken(token) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}
export function getUser() {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
}
export function setUser(user) {
  if (user) localStorage.setItem('auth_user', JSON.stringify(user));
  else localStorage.removeItem('auth_user');
}
export function isAuthenticated() { return !!getToken(); }
export function clearAuth() { setToken(null); setUser(null); }

// Profile picture helpers (frontend only, stored in localStorage)
export function getProfilePicture() {
  const user = getUser();
  return user?.profilePicture || null;
}

export function setProfilePicture(profilePicture) {
  const user = getUser();
  if (user) {
    user.profilePicture = profilePicture || '';
    setUser(user);
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `Server error: ${response.status}`);
    }
    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
        if (window.location.pathname !== '/') window.location.href = '/';
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error');
      throw new Error('Failed to connect to server.');
    }
    console.error('API request error:', error);
    throw error;
  }
}

export const authAPI = {
  async register(username, email, password) {
    const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
    if (data.success && data.data.token) { setToken(data.data.token); setUser(data.data.user); }
    return data;
  },
  async login(email, password) {
    const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.success && data.data.token) { setToken(data.data.token); setUser(data.data.user); }
    return data;
  },
  async getProfile() { return apiRequest('/auth/profile'); },
  async updateProfile(username, email) {
    const data = await apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify({ username, email }) });
    if (data.success && data.data.user) {
      // Preserve profile picture from localStorage when updating profile
      const currentProfilePicture = getProfilePicture();
      const updatedUser = { ...data.data.user };
      if (currentProfilePicture) {
        updatedUser.profilePicture = currentProfilePicture;
      }
      setUser(updatedUser);
    }
    return data;
  },
  async changePassword(currentPassword, newPassword) {
    return apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
  },
  logout() { clearAuth(); },
};

export const contactsAPI = {
  async getAll() {
    const data = await apiRequest('/contact');
    if (data.success && data.data.contacts) return data.data.contacts.map(transformContactFromBackend);
    return [];
  },
  async getById(id) {
    const data = await apiRequest(`/contact/${id}`);
    if (data.success && data.data.contact) return transformContactFromBackend(data.data.contact);
    return null;
  },
  async create(contact) {
    const data = await apiRequest('/contact', { method: 'POST', body: JSON.stringify(transformContactToBackend(contact)) });
    if (data.success && data.data.contact) return transformContactFromBackend(data.data.contact);
    return null;
  },
  async update(id, contact) {
    const data = await apiRequest(`/contact/${id}`, { method: 'PUT', body: JSON.stringify(transformContactToBackend(contact)) });
    if (data.success && data.data.contact) return transformContactFromBackend(data.data.contact);
    return null;
  },
  async delete(id) {
    const data = await apiRequest(`/contact/${id}`, { method: 'DELETE' });
    return data.success;
  },
  async toggleStar(id, currentStarred) {
    return this.update(id, { starred: !currentStarred });
  },
};

function transformContactFromBackend(contact) {
  // Combine names for display if 'name' is missing
  const fullName = contact.name ? contact.name : `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  return {
    id: contact._id,
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    name: fullName, 
    email: contact.email || '',
    phone: contact.phone || '',
    profilePicture: contact.profilePicture || '',
    company: contact.company || '',
    jobTitle: contact.jobTitle || '',
    address: contact.address || '',
    socialMedia: contact.socialMedia || [],
    department: contact.department || '', 
    starred: contact.starred || false,
    notes: contact.notes || '',
    createdAt: contact.createdAt ? new Date(contact.createdAt).getTime() : Date.now(),
  };
}

function transformContactToBackend(contact) {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    profilePicture: contact.profilePicture || '',
    company: contact.company,
    jobTitle: contact.jobTitle,
    address: contact.address,
    socialMedia: contact.socialMedia,
    email: contact.email,
    phone: contact.phone,
    department: contact.department || '',
    starred: contact.starred || false,
    notes: contact.notes || '',
  };
}
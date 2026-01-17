// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// Generic fetch wrapper with auth
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// API endpoints
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<{ token: string; user: { id: string; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  // User
  getProfile: () =>
    apiRequest<{ user: { id: string; name: string; email: string } }>('/user/profile'),

  updateProfile: (name: string) =>
    apiRequest<{ user: { id: string; name: string; email: string } }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  // Devices
  getDevices: () =>
    apiRequest<{ devices: import('../types').Device[] }>('/user/devices'),

  claimDevice: (pairingCode: string) =>
    apiRequest<{ device: import('../types').Device }>('/device/claim', {
      method: 'POST',
      body: JSON.stringify({ pairingCode }),
    }),

  renameDevice: (deviceId: string, displayName: string) =>
    apiRequest<{ device: import('../types').Device }>(`/device/${deviceId}/name`, {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    }),

  getDeviceData: (deviceId: string, range?: string) =>
    apiRequest<{ readings: import('../types').SensorReading[] }>(
      `/device/${deviceId}/data${range ? `?range=${range}` : ''}`
    ),

  updateDeviceConfig: (deviceId: string, config: Partial<import('../types').DeviceConfig>) =>
    apiRequest<{ device: import('../types').Device }>(`/device/${deviceId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};

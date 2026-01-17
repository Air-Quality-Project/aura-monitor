// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Device types
export interface DeviceConfig {
  reportInterval: number; // seconds
  timezone: string;
  otaEnabled: boolean;
}

export interface Device {
  id: string;
  deviceId: string;
  displayName: string;
  firmware: string;
  lastSeen: string;
  isOnline: boolean;
  config: DeviceConfig;
  userId: string;
}

// Sensor data types
export interface SensorReading {
  timestamp: string;
  pm25: number;
  pm10: number;
  co2: number;
  temperature: number;
  humidity: number;
  voc: number;
  aqi: number;
}

export interface DeviceWithData extends Device {
  latestReading?: SensorReading;
  readings?: SensorReading[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ClaimDeviceRequest {
  pairingCode: string;
}

// Chart data types
export interface ChartDataPoint {
  time: string;
  value: number;
  label?: string;
}

// AQI levels
export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export const getAQILevel = (aqi: number): AQILevel => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

export const getAQILabel = (level: AQILevel): string => {
  const labels: Record<AQILevel, string> = {
    'good': 'Good',
    'moderate': 'Moderate',
    'unhealthy-sensitive': 'Unhealthy for Sensitive',
    'unhealthy': 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    'hazardous': 'Hazardous',
  };
  return labels[level];
};

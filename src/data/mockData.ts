import { Device, SensorReading, DeviceWithData } from '@/types';

// Generate realistic mock sensor readings
const generateReadings = (hours: number = 24): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Simulate daily patterns (higher pollution during rush hours)
    const hour = timestamp.getHours();
    const rushHourFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 1;
    const nightFactor = hour >= 22 || hour <= 5 ? 0.7 : 1;
    
    const basePM25 = 25 + Math.random() * 30;
    const pm25 = Math.round(basePM25 * rushHourFactor * nightFactor);
    
    readings.push({
      timestamp: timestamp.toISOString(),
      pm25,
      pm10: Math.round(pm25 * 1.5 + Math.random() * 20),
      co2: Math.round(400 + Math.random() * 400 * rushHourFactor),
      temperature: Math.round((22 + Math.sin(hour / 24 * Math.PI * 2) * 5) * 10) / 10,
      humidity: Math.round(45 + Math.random() * 20),
      voc: Math.round(50 + Math.random() * 100 * rushHourFactor),
      aqi: Math.round(pm25 * 2 + Math.random() * 20),
    });
  }

  return readings;
};

// Mock devices
export const mockDevices: Device[] = [
  {
    id: '1',
    deviceId: 'ESP32-AQ-001',
    displayName: 'Living Room Monitor',
    firmware: 'v2.1.4',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    isOnline: true,
    config: {
      reportInterval: 60,
      timezone: 'Asia/Kolkata',
      otaEnabled: true,
    },
    userId: 'user-1',
  },
  {
    id: '2',
    deviceId: 'ESP32-AQ-002',
    displayName: 'Bedroom Sensor',
    firmware: 'v2.1.4',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    isOnline: true,
    config: {
      reportInterval: 120,
      timezone: 'Asia/Kolkata',
      otaEnabled: true,
    },
    userId: 'user-1',
  },
  {
    id: '3',
    deviceId: 'ESP32-AQ-003',
    displayName: 'Office Monitor',
    firmware: 'v2.0.8',
    lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isOnline: false,
    config: {
      reportInterval: 60,
      timezone: 'Asia/Kolkata',
      otaEnabled: false,
    },
    userId: 'user-1',
  },
  {
    id: '4',
    deviceId: 'ESP32-AQ-004',
    displayName: 'Kitchen Air Quality',
    firmware: 'v2.1.4',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
    isOnline: true,
    config: {
      reportInterval: 30,
      timezone: 'Asia/Kolkata',
      otaEnabled: true,
    },
    userId: 'user-1',
  },
];

// Generate mock data for each device
export const mockDevicesWithData: DeviceWithData[] = mockDevices.map(device => {
  const readings = generateReadings(24);
  return {
    ...device,
    latestReading: readings[readings.length - 1],
    readings,
  };
});

// Mock user
export const mockUser = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  createdAt: '2024-01-15T10:00:00Z',
};

// Dashboard stats
export const getDashboardStats = () => {
  const online = mockDevices.filter(d => d.isOnline).length;
  const offline = mockDevices.filter(d => !d.isOnline).length;
  const alerts = mockDevicesWithData.filter(d => 
    d.latestReading && d.latestReading.aqi > 100
  ).length;

  return {
    totalDevices: mockDevices.length,
    onlineDevices: online,
    offlineDevices: offline,
    activeAlerts: alerts,
  };
};

// Get aggregated chart data
export const getAggregatedChartData = (metric: keyof SensorReading = 'aqi', hours: number = 24) => {
  const data: { time: string; value: number }[] = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Average across all online devices
    const onlineDevices = mockDevicesWithData.filter(d => d.isOnline);
    const avgValue = onlineDevices.reduce((sum, device) => {
      const reading = device.readings?.find(r => 
        new Date(r.timestamp).getHours() === hour
      );
      return sum + (reading ? Number(reading[metric]) : 0);
    }, 0) / Math.max(onlineDevices.length, 1);

    data.push({
      time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(avgValue),
    });
  }

  return data;
};

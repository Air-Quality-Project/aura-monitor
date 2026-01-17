import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { mockDevicesWithData, getAggregatedChartData } from '@/data/mockData';
import { SensorReading } from '@/types';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

type MetricKey = 'aqi' | 'pm25' | 'pm10' | 'co2' | 'temperature' | 'humidity';

const metricLabels: Record<MetricKey, string> = {
  aqi: 'Air Quality Index',
  pm25: 'PM2.5 (μg/m³)',
  pm10: 'PM10 (μg/m³)',
  co2: 'CO₂ (ppm)',
  temperature: 'Temperature (°C)',
  humidity: 'Humidity (%)',
};

const Analytics = () => {
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('aqi');
  const [timeRange, setTimeRange] = useState<string>('24h');

  const devices = mockDevicesWithData.filter(d => d.isOnline);
  
  // Get chart data based on selection
  const getChartData = () => {
    if (selectedDevice === 'all') {
      return getAggregatedChartData(selectedMetric, timeRange === '24h' ? 24 : 168);
    }
    
    const device = devices.find(d => d.id === selectedDevice);
    if (!device?.readings) return [];
    
    return device.readings.slice(-(timeRange === '24h' ? 24 : 168)).map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: r[selectedMetric as keyof SensorReading] as number,
    }));
  };

  const chartData = getChartData();

  // Calculate comparison data
  const getComparisonData = () => {
    return devices.map(device => {
      const avgValue = device.readings
        ? device.readings.reduce((sum, r) => sum + (r[selectedMetric as keyof SensorReading] as number), 0) / device.readings.length
        : 0;
      return {
        name: device.displayName.split(' ')[0], // First word only for chart
        value: Math.round(avgValue),
        fullName: device.displayName,
      };
    });
  };

  const comparisonData = getComparisonData();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Analyze air quality trends across your devices
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricKey)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {devices.map(device => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {['24h', '7d'].map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main trend chart */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold">{metricLabels[selectedMetric]} Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 85%, 43%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 85%, 43%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].value}</p>
                        <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(187, 85%, 43%)"
                strokeWidth={2}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison chart */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-semibold">Device Comparison (Average)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(187, 85%, 43%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;

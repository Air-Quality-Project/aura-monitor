import { AppLayout } from '@/components/layout';
import { StatCard, DeviceStatusCard, AQIChart } from '@/components/dashboard';
import { mockDevicesWithData, getDashboardStats, getAggregatedChartData } from '@/data/mockData';
import { Cpu, Wifi, WifiOff, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = getDashboardStats();
  const chartData = getAggregatedChartData('aqi', 24);
  const onlineDevices = mockDevicesWithData.filter(d => d.isOnline);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your air quality across all devices
            </p>
          </div>
          <Button asChild>
            <Link to="/devices/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Link>
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Devices"
            value={stats.totalDevices}
            subtitle="Registered sensors"
            icon={<Cpu className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Online"
            value={stats.onlineDevices}
            subtitle="Reporting data"
            icon={<Wifi className="h-5 w-5" />}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Offline"
            value={stats.offlineDevices}
            subtitle="Not responding"
            icon={<WifiOff className="h-5 w-5" />}
            variant={stats.offlineDevices > 0 ? 'warning' : 'default'}
          />
          <StatCard
            title="Alerts"
            value={stats.activeAlerts}
            subtitle="Unhealthy AQI readings"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={stats.activeAlerts > 0 ? 'danger' : 'default'}
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart - takes 2 columns */}
          <div className="lg:col-span-2">
            <AQIChart data={chartData} />
          </div>

          {/* Device status list */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Active Devices</h3>
              <Link
                to="/devices"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {onlineDevices.slice(0, 4).map(device => (
                <DeviceStatusCard
                  key={device.id}
                  device={device}
                  latestReading={device.latestReading}
                />
              ))}
              {onlineDevices.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No active devices
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick metrics from latest readings */}
        {onlineDevices[0]?.latestReading && (
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="mb-4">
              <h3 className="font-semibold">Latest Readings</h3>
              <p className="text-sm text-muted-foreground">
                From {onlineDevices[0].displayName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">PM2.5</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.pm25} <span className="text-xs font-normal">μg/m³</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">PM10</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.pm10} <span className="text-xs font-normal">μg/m³</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">CO₂</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.co2} <span className="text-xs font-normal">ppm</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.temperature} <span className="text-xs font-normal">°C</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.humidity} <span className="text-xs font-normal">%</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">VOC</p>
                <p className="text-xl font-bold">{onlineDevices[0].latestReading.voc} <span className="text-xs font-normal">ppb</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;

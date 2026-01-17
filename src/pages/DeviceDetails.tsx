import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { SensorMetricsGrid, AQIChart } from '@/components/dashboard';
import { mockDevicesWithData } from '@/data/mockData';
import { getAQILevel, getAQILabel } from '@/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Cpu,
  Wifi,
  WifiOff,
  Pencil,
  Settings,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const aqiBgClasses: Record<string, string> = {
  'good': 'bg-aqi-good',
  'moderate': 'bg-aqi-moderate',
  'unhealthy-sensitive': 'bg-aqi-unhealthy-sensitive',
  'unhealthy': 'bg-aqi-unhealthy',
  'very-unhealthy': 'bg-aqi-very-unhealthy',
  'hazardous': 'bg-aqi-hazardous',
};

const DeviceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const device = mockDevicesWithData.find(d => d.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(device?.displayName || '');
  const [config, setConfig] = useState(device?.config || {
    reportInterval: 60,
    timezone: 'Asia/Kolkata',
    otaEnabled: true,
  });

  if (!device) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <Cpu className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">Device not found</h2>
          <Button asChild className="mt-4">
            <Link to="/devices">Back to Devices</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const aqiLevel = device.latestReading ? getAQILevel(device.latestReading.aqi) : null;
  const chartData = device.readings?.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    value: r.aqi,
  })) || [];

  const handleSaveName = () => {
    // In production, call API
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back button */}
        <Link
          to="/devices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Devices
        </Link>

        {/* Device header */}
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-card sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Cpu className="h-7 w-7 text-primary" />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="h-9 w-64"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{device.displayName}</h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{device.deviceId}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last seen {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                device.isOnline
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-muted bg-muted text-muted-foreground'
              )}
            >
              {device.isOnline ? (
                <>
                  <Wifi className="mr-1 h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="mr-1 h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
            {aqiLevel && device.latestReading && (
              <div
                className={cn(
                  'rounded-lg px-3 py-1.5 text-white',
                  aqiBgClasses[aqiLevel]
                )}
              >
                <span className="text-lg font-bold">AQI {device.latestReading.aqi}</span>
                <span className="ml-2 text-sm opacity-90">{getAQILabel(aqiLevel)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="live">Live Data</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="firmware">Firmware</TabsTrigger>
          </TabsList>

          {/* Live Data Tab */}
          <TabsContent value="live" className="space-y-6">
            {device.latestReading ? (
              <>
                <SensorMetricsGrid reading={device.latestReading} />
                <AQIChart data={chartData.slice(-24)} height={250} />
              </>
            ) : (
              <div className="rounded-xl border bg-card p-12 text-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <AQIChart data={chartData} height={200} />
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <h3 className="font-semibold">Statistics (24h)</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg AQI</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        (device.readings?.reduce((sum, r) => sum + r.aqi, 0) || 0) /
                        (device.readings?.length || 1)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max AQI</p>
                    <p className="text-2xl font-bold">
                      {Math.max(...(device.readings?.map(r => r.aqi) || [0]))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min AQI</p>
                    <p className="text-2xl font-bold">
                      {Math.min(...(device.readings?.map(r => r.aqi) || [0]))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Points</p>
                    <p className="text-2xl font-bold">{device.readings?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Device Configuration</h3>
              </div>
              
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Report Interval</Label>
                    <Select
                      value={config.reportInterval.toString()}
                      onValueChange={v => setConfig({ ...config, reportInterval: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={config.timezone}
                      onValueChange={v => setConfig({ ...config, timezone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">OTA Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Allow over-the-air firmware updates
                    </p>
                  </div>
                  <Switch
                    checked={config.otaEnabled}
                    onCheckedChange={v => setConfig({ ...config, otaEnabled: v })}
                  />
                </div>

                <Button>Save Configuration</Button>
              </div>
            </div>
          </TabsContent>

          {/* Firmware Tab */}
          <TabsContent value="firmware">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold">Firmware Information</h3>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Version</p>
                    <p className="text-lg font-semibold">{device.firmware}</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Up to date
                  </Badge>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">January 10, 2026</p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">OTA Status</p>
                  <p className="font-medium">
                    {config.otaEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DeviceDetails;

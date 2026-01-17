import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { SensorMetricsGrid, AQIChart } from "@/components/dashboard";
import { api } from "@/services/api";
import { Device, SensorReading, getAQILevel, getAQILabel } from "@/types";
import { cn } from "@/lib/utils";

import {
  ArrowLeft,
  Cpu,
  Wifi,
  WifiOff,
  Pencil,
  Settings,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

/* AQI bg colors */
const aqiBgClasses: Record<string, string> = {
  good: "bg-aqi-good",
  moderate: "bg-aqi-moderate",
  "unhealthy-sensitive": "bg-aqi-unhealthy-sensitive",
  unhealthy: "bg-aqi-unhealthy",
  "very-unhealthy": "bg-aqi-very-unhealthy",
  hazardous: "bg-aqi-hazardous",
};

const DeviceDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [config, setConfig] = useState<Device["config"] | null>(null);

  /* ================= FETCH DEVICE ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const devicesRes = await api.getDevices();
        const found = devicesRes.devices.find((d) => d.id === id);

        if (!found) {
          setLoading(false);
          return;
        }

        setDevice(found);
        setDisplayName(found.displayName);
        setConfig(found.config);

        const dataRes = await api.getDeviceData(found.id, "24h");
        setReadings(dataRes.readings);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          Loading device...
        </div>
      </AppLayout>
    );
  }

  if (!device || !config) {
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

  /* ================= DERIVED ================= */
  const latest = readings[readings.length - 1];
  const aqiLevel = latest ? getAQILevel(latest.aqi) : null;

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: r.aqi,
  }));

  /* ================= ACTIONS ================= */
  const handleSaveName = async () => {
    const res = await api.renameDevice(device.id, displayName);
    setDevice(res.device);
    setIsEditing(false);
  };

  const handleSaveConfig = async () => {
    const res = await api.updateDeviceConfig(device.id, config);
    setDevice(res.device);
  };

  /* ================= UI ================= */
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <Link
          to="/devices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Devices
        </Link>

        {/* Header */}
        <div className="rounded-xl border bg-card p-6 shadow-card flex justify-between">
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-64"
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <h1 className="text-xl font-bold">{device.displayName}</h1>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{device.deviceId}</p>
            <p className="text-xs text-muted-foreground">
              Last seen{" "}
              {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <Badge
              variant="outline"
              className={cn(
                device.isOnline
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-muted bg-muted text-muted-foreground"
              )}
            >
              {device.isOnline ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
              {device.isOnline ? "Online" : "Offline"}
            </Badge>

            {aqiLevel && latest && (
              <div className={cn("px-3 py-1.5 rounded-lg text-white", aqiBgClasses[aqiLevel])}>
                AQI {latest.aqi} · {getAQILabel(aqiLevel)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {latest ? (
              <>
                <SensorMetricsGrid reading={latest} />
                <AQIChart data={chartData.slice(-24)} height={250} />
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AQIChart data={chartData} height={200} />
          </TabsContent>

          <TabsContent value="config">
            <div className="rounded-xl border p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Report Interval</Label>
                  <Select
                    value={config.reportInterval.toString()}
                    onValueChange={(v) =>
                      setConfig({ ...config, reportInterval: parseInt(v) })
                    }
                  >
                    <SelectTrigger />
                    <SelectContent>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">1m</SelectItem>
                      <SelectItem value="120">2m</SelectItem>
                      <SelectItem value="300">5m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={config.timezone}
                    onValueChange={(v) =>
                      setConfig({ ...config, timezone: v })
                    }
                  >
                    <SelectTrigger />
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between border rounded-lg p-4">
                <div>
                  <p className="font-medium">OTA Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Allow firmware updates
                  </p>
                </div>
                <Switch
                  checked={config.otaEnabled}
                  onCheckedChange={(v) =>
                    setConfig({ ...config, otaEnabled: v })
                  }
                />
              </div>

              <Button onClick={handleSaveConfig}>Save Configuration</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DeviceDetails;

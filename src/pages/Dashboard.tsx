import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AppLayout } from "@/components/layout";
import { StatCard, DeviceStatusCard, AQIChart } from "@/components/dashboard";
import { api } from "@/services/api";
import { Device } from "@/types";
import { useAuth } from "@/hooks/useAuth";

import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* ----------------------------------
   Component
---------------------------------- */
const Dashboard = () => {
  const { user } = useAuth();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------
     Fetch devices
  ---------------------------------- */
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await api.getDevices();
        setDevices(Array.isArray(res.devices) ? res.devices : []);
      } catch (err) {
        console.error("Failed to load dashboard devices", err);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  /* ----------------------------------
     Derived data (NO MOCKS)
  ---------------------------------- */
  const onlineDevices = useMemo(
    () => devices.filter(d => d.isOnline),
    [devices]
  );

  const offlineDevices = devices.length - onlineDevices.length;

  const activeAlerts = useMemo(() => {
    return devices.filter(
      d => d.latestReading && d.latestReading.aqi >= 150
    ).length;
  }, [devices]);

  const chartData = useMemo(() => {
    const readings = devices
      .flatMap(d => d.readings || [])
      .slice(-24);

    return readings.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: r.aqi,
    }));
  }, [devices]);

  /* ----------------------------------
     Loading
  ---------------------------------- */
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Loading dashboard…
        </div>
      </AppLayout>
    );
  }

  /* ----------------------------------
     UI
  ---------------------------------- */
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Devices"
            value={devices.length}
            subtitle="Registered sensors"
            icon={<Cpu className="h-5 w-5" />}
            variant="primary"
          />

          <StatCard
            title="Online"
            value={onlineDevices.length}
            subtitle="Reporting data"
            icon={<Wifi className="h-5 w-5" />}
            variant="success"
          />

          <StatCard
            title="Offline"
            value={offlineDevices}
            subtitle="Not responding"
            icon={<WifiOff className="h-5 w-5" />}
            variant={offlineDevices > 0 ? "warning" : "default"}
          />

          <StatCard
            title="Alerts"
            value={activeAlerts}
            subtitle="Unhealthy AQI"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={activeAlerts > 0 ? "danger" : "default"}
          />
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AQIChart data={chartData} />
          </div>

          {/* Active devices */}
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

        {/* Latest readings */}
        {onlineDevices[0]?.latestReading && (
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="mb-4">
              <h3 className="font-semibold">Latest Readings</h3>
              <p className="text-sm text-muted-foreground">
                From {onlineDevices[0].displayName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(onlineDevices[0].latestReading)
                .filter(([key]) => key !== "timestamp" && key !== "aqi")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-muted/50 p-3"
                  >
                    <p className="text-xs text-muted-foreground">
                      {key.toUpperCase()}
                    </p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;

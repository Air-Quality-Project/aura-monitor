import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout";
import { api } from "@/services/api";
import { Device } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------------
   Constants
---------------------------------- */
const LATEST_FIRMWARE = "v2.1.4";

const firmwareVersions = [
  {
    version: "v2.1.4",
    date: "2026-01-10",
    status: "latest" as const,
    changelog: "Bug fixes and performance improvements",
  },
  {
    version: "v2.1.3",
    date: "2026-01-05",
    status: "stable" as const,
    changelog: "Added VOC sensor calibration",
  },
  {
    version: "v2.0.8",
    date: "2025-12-15",
    status: "outdated" as const,
    changelog: "Initial stable release",
  },
];

/* ----------------------------------
   Component
---------------------------------- */
const Firmware = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------
     Load devices from backend
  ---------------------------------- */
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await api.getDevices();
        setDevices(Array.isArray(res.devices) ? res.devices : []);
      } catch (err) {
        console.error("Failed to load devices", err);
        setError("Failed to load devices");
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  /* ----------------------------------
     Derived stats (SAFE)
  ---------------------------------- */
  const upToDateDevices = useMemo(
    () => devices.filter(d => d.firmware === LATEST_FIRMWARE),
    [devices]
  );

  const outdatedDevices = useMemo(
    () => devices.filter(d => d.firmware !== LATEST_FIRMWARE),
    [devices]
  );

  const otaEnabledDevices = useMemo(
    () => devices.filter(d => d.config?.otaEnabled),
    [devices]
  );

  /* ----------------------------------
     Loading / Error states
  ---------------------------------- */
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Loading firmware data…
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-destructive">
          {error}
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
              OTA & Firmware
            </h1>
            <p className="text-muted-foreground">
              Manage firmware updates for your devices
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Check for Updates
          </Button>
        </div>

        {/* Status overview */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-success" />}
            value={upToDateDevices.length}
            label="Up to date"
            bg="bg-success/10"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-warning" />}
            value={outdatedDevices.length}
            label="Updates available"
            bg="bg-warning/10"
          />
          <StatCard
            icon={<Download className="h-5 w-5 text-primary" />}
            value={otaEnabledDevices.length}
            label="OTA enabled"
            bg="bg-primary/10"
          />
        </div>

        {/* Firmware versions */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Available Firmware</h3>
          <div className="mt-4 space-y-3">
            {firmwareVersions.map(fw => (
              <div
                key={fw.version}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4",
                  fw.status === "latest" &&
                    "border-success/30 bg-success/5"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fw.version}</span>
                    <Badge>{fw.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fw.changelog}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {fw.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Device firmware status */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Device Firmware Status</h3>

          {devices.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No devices found
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {devices.map(device => {
                const isLatest =
                  device.firmware === LATEST_FIRMWARE;
                const otaEnabled = device.config?.otaEnabled;

                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Cpu className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {device.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current: {device.firmware}
                        </p>
                      </div>
                    </div>

                    {isLatest ? (
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/30"
                      >
                        Up to date
                      </Badge>
                    ) : otaEnabled ? (
                      <Button size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Update
                      </Button>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-warning border-warning/30"
                      >
                        OTA disabled
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* OTA progress (placeholder) */}
        <div className="rounded-xl border bg-card p-6 shadow-card opacity-50">
          <h3 className="font-semibold">Active Updates</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No updates in progress
          </p>
          <Progress value={0} className="mt-4" />
        </div>
      </div>
    </AppLayout>
  );
};

/* ----------------------------------
   Small stat card
---------------------------------- */
const StatCard = ({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
}) => (
  <div className="rounded-xl border bg-card p-5 shadow-card">
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          bg
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

export default Firmware;

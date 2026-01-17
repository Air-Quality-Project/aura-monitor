import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { api } from "@/services/api";
import { Device, getAQILevel } from "@/types";
import { cn } from "@/lib/utils";

import {
  Cpu,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

/* ----------------------------------
   AQI color map
---------------------------------- */
const aqiColorClasses: Record<string, string> = {
  good: "bg-aqi-good/10 text-aqi-good border-aqi-good/30",
  moderate: "bg-aqi-moderate/10 text-aqi-moderate border-aqi-moderate/30",
  "unhealthy-sensitive":
    "bg-aqi-unhealthy-sensitive/10 text-aqi-unhealthy-sensitive border-aqi-unhealthy-sensitive/30",
  unhealthy:
    "bg-aqi-unhealthy/10 text-aqi-unhealthy border-aqi-unhealthy/30",
  "very-unhealthy":
    "bg-aqi-very-unhealthy/10 text-aqi-very-unhealthy border-aqi-very-unhealthy/30",
  hazardous:
    "bg-aqi-hazardous/10 text-aqi-hazardous border-aqi-hazardous/30",
};

/* ----------------------------------
   Component
---------------------------------- */
const Devices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] =
    useState<"all" | "online" | "offline">("all");

  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    device: Device | null;
  }>({ open: false, device: null });

  const [newName, setNewName] = useState("");

  /* ----------------------------------
     Fetch devices
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
     Filtered devices (SAFE)
  ---------------------------------- */
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch =
        device.displayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        device.deviceId
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (filter === "online") return matchesSearch && device.isOnline;
      if (filter === "offline")
        return matchesSearch && !device.isOnline;

      return matchesSearch;
    });
  }, [devices, searchQuery, filter]);

  /* ----------------------------------
     Rename handlers
  ---------------------------------- */
  const handleRename = (device: Device) => {
    setNewName(device.displayName);
    setRenameDialog({ open: true, device });
  };

  const handleSaveRename = async () => {
    if (!renameDialog.device) return;

    try {
      await api.renameDevice(renameDialog.device.id, newName);

      setDevices(prev =>
        prev.map(d =>
          d.id === renameDialog.device?.id
            ? { ...d, displayName: newName }
            : d
        )
      );
    } catch (err) {
      console.error("Rename failed", err);
    } finally {
      setRenameDialog({ open: false, device: null });
    }
  };

  /* ----------------------------------
     Loading / Error
  ---------------------------------- */
  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Loading devices…
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
              Devices
            </h1>
            <p className="text-muted-foreground">
              Manage your ESP32 air quality monitors
            </p>
          </div>
          <Button asChild>
            <Link to="/devices/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "online", "offline"] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Device grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDevices.map(device => {
            const aqiLevel = device.latestReading
              ? getAQILevel(device.latestReading.aqi)
              : null;

            return (
              <div
                key={device.id}
                className="rounded-xl border bg-card p-5 shadow-card"
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "absolute right-4 top-4",
                    device.isOnline
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-muted bg-muted text-muted-foreground"
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

                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">
                    {device.displayName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {device.deviceId}
                  </p>
                </div>

                {device.latestReading && aqiLevel && (
                  <div
                    className={cn(
                      "mt-3 inline-block rounded-md border px-2 py-1 text-sm",
                      aqiColorClasses[aqiLevel]
                    )}
                  >
                    AQI {device.latestReading.aqi}
                  </div>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Last seen{" "}
                  {formatDistanceToNow(
                    new Date(device.lastSeen),
                    { addSuffix: true }
                  )}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Link to={`/devices/${device.id}`}>
                      View
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleRename(device)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDevices.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No devices found
          </div>
        )}
      </div>

      {/* Rename dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={open =>
          setRenameDialog({ open, device: renameDialog.device })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Device</DialogTitle>
            <DialogDescription>
              Give your device a memorable name
            </DialogDescription>
          </DialogHeader>

          <Label>Display Name</Label>
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRenameDialog({ open: false, device: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Devices;

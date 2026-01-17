import { AppLayout } from '@/components/layout';
import { mockDevices } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const firmwareVersions = [
  { version: 'v2.1.4', date: '2026-01-10', status: 'latest' as const, changelog: 'Bug fixes and performance improvements' },
  { version: 'v2.1.3', date: '2026-01-05', status: 'stable' as const, changelog: 'Added VOC sensor calibration' },
  { version: 'v2.0.8', date: '2025-12-15', status: 'outdated' as const, changelog: 'Initial stable release' },
];

const Firmware = () => {
  const devicesWithOTA = mockDevices.filter(d => d.config.otaEnabled);
  const outdatedDevices = mockDevices.filter(d => d.firmware !== 'v2.1.4');

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OTA & Firmware</h1>
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
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockDevices.filter(d => d.firmware === 'v2.1.4').length}</p>
                <p className="text-sm text-muted-foreground">Up to date</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outdatedDevices.length}</p>
                <p className="text-sm text-muted-foreground">Updates available</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{devicesWithOTA.length}</p>
                <p className="text-sm text-muted-foreground">OTA enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Firmware versions */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Available Firmware</h3>
          <div className="mt-4 space-y-3">
            {firmwareVersions.map(fw => (
              <div
                key={fw.version}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-4',
                  fw.status === 'latest' && 'border-success/30 bg-success/5'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fw.version}</span>
                      {fw.status === 'latest' && (
                        <Badge className="bg-success text-success-foreground">Latest</Badge>
                      )}
                      {fw.status === 'stable' && (
                        <Badge variant="secondary">Stable</Badge>
                      )}
                      {fw.status === 'outdated' && (
                        <Badge variant="outline">Outdated</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{fw.changelog}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{fw.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device update status */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Device Firmware Status</h3>
          <div className="mt-4 space-y-4">
            {mockDevices.map(device => {
              const isLatest = device.firmware === 'v2.1.4';
              const otaEnabled = device.config.otaEnabled;

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
                      <p className="font-medium">{device.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {device.firmware}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLatest ? (
                      <Badge className="bg-success/10 text-success border-success/30" variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Up to date
                      </Badge>
                    ) : otaEnabled ? (
                      <Button size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Update to v2.1.4
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-warning border-warning/30">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        OTA disabled
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OTA progress simulation */}
        <div className="rounded-xl border bg-card p-6 shadow-card opacity-50">
          <h3 className="font-semibold">Active Updates</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No updates in progress
          </p>
          
          {/* Example of what an update would look like */}
          <div className="mt-4 rounded-lg border border-dashed p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Example: Kitchen Air Quality</span>
              <span className="text-xs text-muted-foreground">v2.0.8 → v2.1.4</span>
            </div>
            <Progress value={0} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">Waiting to start...</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Firmware;

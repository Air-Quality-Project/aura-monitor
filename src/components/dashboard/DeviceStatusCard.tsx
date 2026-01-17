import { Link } from 'react-router-dom';
import { Device, SensorReading, getAQILevel, getAQILabel } from '@/types';
import { cn } from '@/lib/utils';
import { Cpu, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeviceStatusCardProps {
  device: Device;
  latestReading?: SensorReading;
}

const aqiColorClasses: Record<string, string> = {
  'good': 'text-aqi-good',
  'moderate': 'text-aqi-moderate',
  'unhealthy-sensitive': 'text-aqi-unhealthy-sensitive',
  'unhealthy': 'text-aqi-unhealthy',
  'very-unhealthy': 'text-aqi-very-unhealthy',
  'hazardous': 'text-aqi-hazardous',
};

export const DeviceStatusCard = ({ device, latestReading }: DeviceStatusCardProps) => {
  const aqiLevel = latestReading ? getAQILevel(latestReading.aqi) : null;

  return (
    <Link
      to={`/devices/${device.id}`}
      className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-card-hover"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Cpu className="h-5 w-5 text-muted-foreground" />
          </div>
          {/* Status indicator */}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
              device.isOnline ? 'bg-success status-pulse' : 'bg-muted-foreground'
            )}
          />
        </div>
        
        <div>
          <p className="font-medium">{device.displayName}</p>
          <p className="text-xs text-muted-foreground">
            {device.isOnline ? (
              <>Last seen {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}</>
            ) : (
              <>Offline • {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {latestReading && aqiLevel && (
          <div className="text-right">
            <p className={cn('text-lg font-bold', aqiColorClasses[aqiLevel])}>
              AQI {latestReading.aqi}
            </p>
            <p className="text-xs text-muted-foreground">{getAQILabel(aqiLevel)}</p>
          </div>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

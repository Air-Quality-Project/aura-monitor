import { SensorReading, getAQILevel } from '@/types';
import { cn } from '@/lib/utils';
import { Wind, Thermometer, Droplets, Cloud, Gauge, Leaf } from 'lucide-react';

interface SensorMetricsGridProps {
  reading: SensorReading;
  className?: string;
}

const metrics = [
  { key: 'pm25', label: 'PM2.5', unit: 'μg/m³', icon: Cloud, warn: 35, danger: 55 },
  { key: 'pm10', label: 'PM10', unit: 'μg/m³', icon: Wind, warn: 54, danger: 154 },
  { key: 'co2', label: 'CO₂', unit: 'ppm', icon: Leaf, warn: 800, danger: 1200 },
  { key: 'temperature', label: 'Temp', unit: '°C', icon: Thermometer, warn: 30, danger: 35 },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: Droplets, warn: 70, danger: 80 },
  { key: 'voc', label: 'VOC', unit: 'ppb', icon: Gauge, warn: 150, danger: 250 },
] as const;

export const SensorMetricsGrid = ({ reading, className }: SensorMetricsGridProps) => {
  const getMetricColor = (key: string, value: number) => {
    const metric = metrics.find(m => m.key === key);
    if (!metric) return 'text-foreground';
    if (value >= metric.danger) return 'text-destructive';
    if (value >= metric.warn) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6', className)}>
      {metrics.map(metric => {
        const value = reading[metric.key as keyof SensorReading] as number;
        const Icon = metric.icon;
        
        return (
          <div
            key={metric.key}
            className="rounded-lg border bg-card p-3 shadow-card"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <p className={cn('mt-1 text-xl font-bold', getMetricColor(metric.key, value))}>
              {value}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {metric.unit}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

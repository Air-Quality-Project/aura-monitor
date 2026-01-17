import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

interface AQIChartProps {
  data: { time: string; value: number }[];
  height?: number;
  className?: string;
}

export const AQIChart = ({ data, height = 300, className }: AQIChartProps) => {
  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-card', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Air Quality Trend</h3>
          <p className="text-sm text-muted-foreground">Average AQI across all devices</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <p className="text-sm font-medium">AQI: {payload[0].value}</p>
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
            fill="url(#aqiGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

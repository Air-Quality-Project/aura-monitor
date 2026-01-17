import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Wind, Loader2 } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden flex-col justify-between gradient-primary p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Wind className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">AirPulse</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Monitor Your Air Quality<br />
            <span className="text-white/80">Anytime, Anywhere</span>
          </h1>
          <p className="max-w-md text-lg text-white/70">
            Real-time air quality monitoring powered by ESP32. Track PM2.5, CO₂, 
            temperature, humidity, and more from your IoT devices.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">1000+</p>
            <p className="text-sm text-white/70">Active Devices</p>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50M+</p>
            <p className="text-sm text-white/70">Data Points</p>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-bold text-white">99.9%</p>
            <p className="text-sm text-white/70">Uptime</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Wind className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">AirPulse</span>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Cpu, QrCode } from 'lucide-react';
import { z } from 'zod';

const pairingSchema = z.object({
  pairingCode: z.string()
    .length(6, 'Pairing code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Pairing code must contain only letters and numbers'),
});

const AddDevice = () => {
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const upperCode = pairingCode.toUpperCase();
    const result = pairingSchema.safeParse({ pairingCode: upperCode });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success (in production, call API)
      setSuccess(true);
      setTimeout(() => navigate('/devices'), 2000);
    } catch (err) {
      setError('Failed to pair device. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Device Paired!</h2>
          <p className="mt-2 text-muted-foreground">
            Your device has been successfully added
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Redirecting to devices...
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Cpu className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Add New Device</h1>
          <p className="mt-2 text-muted-foreground">
            Pair your ESP32 air quality monitor
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-xl border bg-muted/30 p-6">
          <h3 className="font-medium">How to get your pairing code:</h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                1
              </span>
              Power on your ESP32 device
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                2
              </span>
              Connect it to WiFi using the setup process
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                3
              </span>
              A 6-digit code will appear on the device display
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                4
              </span>
              Enter that code below to complete pairing
            </li>
          </ol>
        </div>

        {/* Pairing form */}
        <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
          {error && (
            <Alert variant="destructive" className="mb-4 animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pairingCode">Pairing Code</Label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pairingCode"
                  value={pairingCode}
                  onChange={e => setPairingCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="h-14 pl-11 text-center text-2xl font-mono tracking-[0.5em] uppercase"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code displayed on your device
              </p>
            </div>

            <Button
              type="submit"
              className="h-12 w-full"
              disabled={isLoading || pairingCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pairing device...
                </>
              ) : (
                'Pair Device'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Having trouble? Check our{' '}
          <a href="#" className="text-primary hover:underline">
            setup guide
          </a>{' '}
          or{' '}
          <a href="#" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </AppLayout>
  );
};

export default AddDevice;

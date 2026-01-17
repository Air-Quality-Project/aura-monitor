import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { mockUser } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  Bell,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(mockUser.name);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {saved && (
          <Alert className="border-success/30 bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Profile section */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  value={mockUser.email}
                  disabled
                  className="max-w-sm"
                />
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Notifications section */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Notifications</h2>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when air quality is unhealthy
                </p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={v => setNotifications({ ...notifications, emailAlerts: v })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get real-time push notifications
                </p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={v => setNotifications({ ...notifications, pushNotifications: v })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Report</p>
                <p className="text-sm text-muted-foreground">
                  Receive weekly air quality summary
                </p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={v => setNotifications({ ...notifications, weeklyReport: v })}
              />
            </div>
          </div>
        </div>

        {/* Security section */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Security</h2>
          </div>

          <div className="mt-6 space-y-4">
            <Button variant="outline">Change Password</Button>
            
            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">
                Account created on {new Date(mockUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Logout section */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign out of your account on this device
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  Shield,
  Bell,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

/* =======================
   Types
   ======================= */
type NotificationSettings = {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
};

/* =======================
   Component
   ======================= */
const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      emailAlerts: true,
      pushNotifications: false,
      weeklyReport: true,
    });

  /* Sync auth user → local state */
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  /* ✅ BACKEND-CONNECTED SAVE */
  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const res = await api.updateProfile(name);

      // sync global auth state
      updateUser(res.user);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* Prevent white screen */
  if (!user) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Loading settings...
        </div>
      </AppLayout>
    );
  }

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

        {/* Profile */}
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
                onChange={(e) => setName(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2">
                <Input value={user.email} disabled className="max-w-sm" />
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

        {/* Notifications */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Notifications</h2>
          </div>

          <div className="mt-6 space-y-4">
            {(
              [
                ["Email Alerts", "emailAlerts"],
                ["Push Notifications", "pushNotifications"],
                ["Weekly Report", "weeklyReport"],
              ] as const
            ).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between">
                <p className="font-medium">{label}</p>
                <Switch
                  checked={notifications[key]}
                  onCheckedChange={(value) =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Security</h2>
          </div>

          <div className="mt-6 space-y-4">
            <Button variant="outline">Change Password</Button>
          </div>
        </div>

        {/* Logout */}
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

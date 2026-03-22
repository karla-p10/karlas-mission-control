"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SettingsSection, SettingsRow } from "@/components/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Calendar, Bell, Palette, Shield, RefreshCw, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [name, setName] = useState("Karla");
  const [email, setEmail] = useState("karla@family.com");
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailyDigest: true,
    weeklyReview: false,
    calendarSync: false,
  });
  const [theme, setTheme] = useState("system");
  const [calendarConnected] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your profile and preferences</p>
        </div>

        {/* Profile */}
        <SettingsSection
          title="Profile"
          description="Your personal information"
        >
          <div className="px-6 py-5 space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-white text-xl font-bold">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm hover:bg-primary/90 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{name || "Your Name"}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
                <button className="text-xs text-primary hover:underline mt-0.5">Change photo</button>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Display Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              className={cn(
                "rounded-xl gap-2 transition-all",
                saved
                  ? "bg-emerald-600 hover:bg-emerald-600"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </SettingsSection>

        {/* Google Calendar */}
        <SettingsSection
          title="Integrations"
          description="Connect your external services"
        >
          <div className="px-6 py-5">
            <div className={cn(
              "rounded-2xl border p-4",
              calendarConnected ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border flex-shrink-0 mt-0.5">
                    <Calendar className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">Google Calendar</p>
                      {calendarConnected && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {calendarConnected
                        ? "Your Google Calendar is synced. Events appear automatically."
                        : "Sync your Google Calendar to see all events alongside your tasks."}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={calendarConnected ? "outline" : "default"}
                  className={cn(
                    "rounded-xl gap-1.5 text-xs flex-shrink-0",
                    !calendarConnected && "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {calendarConnected ? (
                    <>
                      <RefreshCw className="w-3 h-3" /> Sync now
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3 h-3" /> Connect
                    </>
                  )}
                </Button>
              </div>

              {!calendarConnected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-[11px] text-blue-600">
                    🔒 Secure OAuth 2.0 connection. Rosie only reads your calendar — it never modifies events without your permission.
                  </p>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          title="Notifications"
          description="Choose what you hear about"
        >
          <SettingsRow
            label="Task Reminders"
            description="Get notified before tasks are due"
          >
            <Switch
              checked={notifications.taskReminders}
              onCheckedChange={(v) => setNotifications({ ...notifications, taskReminders: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Daily Digest"
            description="Morning summary of the day ahead"
          >
            <Switch
              checked={notifications.dailyDigest}
              onCheckedChange={(v) => setNotifications({ ...notifications, dailyDigest: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Weekly Review"
            description="Sunday recap of what you accomplished"
          >
            <Switch
              checked={notifications.weeklyReview}
              onCheckedChange={(v) => setNotifications({ ...notifications, weeklyReview: v })}
            />
          </SettingsRow>
          <SettingsRow
            label="Calendar Sync Alerts"
            description="Know when calendar sync completes or fails"
          >
            <Switch
              checked={notifications.calendarSync}
              onCheckedChange={(v) => setNotifications({ ...notifications, calendarSync: v })}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          title="Appearance"
          description="Make Rosie look how you like it"
        >
          <SettingsRow
            label="Theme"
            description="Light, dark, or follow your system"
          >
            <Select value={theme} onValueChange={(v) => setTheme(v ?? "system")}>
              <SelectTrigger className="w-32 rounded-xl h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="light">☀️ Light</SelectItem>
                <SelectItem value="dark">🌙 Dark</SelectItem>
                <SelectItem value="system">💻 System</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow
            label="Accent Color"
            description="Your Rosie brand color"
          >
            <div className="flex gap-2">
              {[
                { color: "#5BB5A2", name: "Teal" },
                { color: "#6366f1", name: "Indigo" },
                { color: "#ec4899", name: "Pink" },
                { color: "#f59e0b", name: "Amber" },
              ].map(({ color, name }) => (
                <button
                  key={name}
                  title={name}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    color === "#5BB5A2" ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow label="Privacy Policy" description="How we handle your data">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-muted-foreground">
              View <ExternalLink className="w-3 h-3" />
            </Button>
          </SettingsRow>
          <SettingsRow label="Export Data" description="Download all your tasks">
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Export CSV
            </Button>
          </SettingsRow>
          <SettingsRow label="Delete Account" description="Permanently remove your account">
            <Button variant="outline" size="sm" className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
              Delete
            </Button>
          </SettingsRow>
        </SettingsSection>

        {/* Version footer */}
        <p className="text-center text-xs text-muted-foreground py-2">
          Rosie v1.0.0 · Made with ❤️ for busy moms
        </p>
      </div>
    </AppShell>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Bell, Palette, Shield, Upload, Camera } from "lucide-react";
import { theme } from "@/config/theme";
import { useAppSelector } from "@/store/hooks";

const SETTINGS_TABS = [
  { id: "profile", label: "Profile", icon: User },

  { id: "security", label: "Security", icon: Shield },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none"
                style={{
                  background: isActive ? theme.surfaceHover : "transparent",
                  color: isActive ? theme.textPrimary : theme.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = theme.surfaceMuted;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon
                  className="size-4"
                  style={{ color: isActive ? theme.accent : theme.textMuted }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-xl p-6 md:p-8"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
            }}
          >
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Content Components ────────────────────────────────────────── */

const ProfileSettings = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  // Split name for the form
  const nameParts = (user?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Profile Information
        </h3>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Update your photo and personal details here.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0 relative group">
          <div
            className="size-24 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden"
            style={{
              background: theme.accentSoft,
              color: theme.accent,
              border: `1px solid ${theme.accent}30`,
            }}
          >
            {initials}
          </div>
          <button className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="size-6 text-white" />
          </button>
        </div>
        <div className="space-y-1.5 flex-1 pt-2">
          <h4
            className="text-sm font-medium"
            style={{ color: theme.textPrimary }}
          >
            Profile picture
          </h4>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            JPG, GIF or PNG. Max size of 800K.
          </p>
          <div className="pt-2 flex gap-3">
            <Button size="sm" variant="outline" className="h-8">
              Change
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              style={{ color: theme.destructive }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            First Name
          </label>
          <Input
            defaultValue={firstName}
            className="bg-transparent"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            Last Name
          </label>
          <Input
            defaultValue={lastName}
            className="bg-transparent"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            Email Address
          </label>
          <Input
            defaultValue={user?.email || ""}
            disabled
            className="bg-transparent"
            style={{ borderColor: theme.border, color: theme.textPrimary, opacity: 0.7 }}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            Role / Tagline
          </label>
          <Input
            defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
            disabled
            className="bg-transparent capitalize"
            style={{ borderColor: theme.border, color: theme.textPrimary, opacity: 0.7 }}
          />
        </div>
      </div>

      <div
        className="pt-4 border-t flex justify-end gap-3"
        style={{ borderColor: theme.border }}
      >
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

const AppearanceSettings = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Appearance
        </h3>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Customize how Recruit-OS looks on your device.
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="text-sm font-medium"
          style={{ color: theme.textSecondary }}
        >
          Theme Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="border-2 rounded-lg p-1 cursor-pointer"
            style={{ borderColor: theme.accent }}
          >
            <div className="h-24 rounded bg-gray-950 flex flex-col gap-2 p-2 border border-gray-800">
              <div className="h-2 w-1/3 bg-gray-800 rounded"></div>
              <div className="h-2 w-full bg-gray-800 rounded"></div>
              <div className="h-2 w-2/3 bg-gray-800 rounded"></div>
            </div>
            <p
              className="text-center text-xs font-medium mt-2 mb-1"
              style={{ color: theme.textPrimary }}
            >
              Dark
            </p>
          </div>
          <div
            className="border-2 rounded-lg p-1 cursor-pointer"
            style={{ borderColor: "transparent" }}
          >
            <div className="h-24 rounded bg-white flex flex-col gap-2 p-2 border border-gray-200">
              <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-2 w-full bg-gray-200 rounded"></div>
              <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
            </div>
            <p
              className="text-center text-xs font-medium mt-2 mb-1"
              style={{ color: theme.textMuted }}
            >
              Light
            </p>
          </div>
          <div
            className="border-2 rounded-lg p-1 cursor-pointer"
            style={{ borderColor: "transparent" }}
          >
            <div className="h-24 rounded bg-gradient-to-r from-gray-950 to-white flex flex-col gap-2 p-2 border border-gray-800">
              <div className="h-2 w-1/3 bg-gray-500 rounded"></div>
              <div className="h-2 w-full bg-gray-500 rounded"></div>
              <div className="h-2 w-2/3 bg-gray-500 rounded"></div>
            </div>
            <p
              className="text-center text-xs font-medium mt-2 mb-1"
              style={{ color: theme.textMuted }}
            >
              System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Notifications
        </h3>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Choose what updates you want to receive.
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle 1 */}
        <div className="flex items-center justify-between">
          <div>
            <h4
              className="text-sm font-medium"
              style={{ color: theme.textPrimary }}
            >
              Candidate Submissions
            </h4>
            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
              Get notified when a new candidate is submitted.
            </p>
          </div>
          <div
            className="w-9 h-5 rounded-full relative cursor-pointer"
            style={{ background: theme.accent }}
          >
            <div className="absolute right-1 top-1 size-3 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between">
          <div>
            <h4
              className="text-sm font-medium"
              style={{ color: theme.textPrimary }}
            >
              Approval Updates
            </h4>
            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
              Receive emails when a submission is approved/rejected.
            </p>
          </div>
          <div
            className="w-9 h-5 rounded-full relative cursor-pointer"
            style={{ background: theme.accent }}
          >
            <div className="absolute right-1 top-1 size-3 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Toggle 3 */}
        <div className="flex items-center justify-between">
          <div>
            <h4
              className="text-sm font-medium"
              style={{ color: theme.textPrimary }}
            >
              Weekly Reports
            </h4>
            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
              Receive a weekly digest of your pipeline.
            </p>
          </div>
          <div
            className="w-9 h-5 rounded-full relative cursor-pointer"
            style={{
              background: theme.surfaceMuted,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="absolute left-1 top-1 size-3 rounded-full"
              style={{ background: theme.textMuted }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Security
        </h3>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Manage your password and security settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            Current Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            className="bg-transparent max-w-sm"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: theme.textSecondary }}
          >
            New Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            className="bg-transparent max-w-sm"
            style={{ borderColor: theme.border, color: theme.textPrimary }}
          />
        </div>
        <div className="pt-2">
          <Button>Update Password</Button>
        </div>
      </div>

      <div
        className="pt-6 border-t space-y-4"
        style={{ borderColor: theme.border }}
      >
        <div>
          <h4
            className="text-sm font-medium"
            style={{ color: theme.textPrimary }}
          >
            Two-Factor Authentication
          </h4>
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
            Add an extra layer of security to your account.
          </p>
        </div>
        <Button variant="outline">Enable 2FA</Button>
      </div>
    </div>
  );
};

export default SettingsPage;

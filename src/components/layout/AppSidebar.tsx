import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  CalendarCheck,
  BarChart3,
  FileText,
  MessageSquare,
  ClipboardCheck,
  Activity,
  ChevronLeft,
  Zap,
  Settings,
  LogOut,
} from "lucide-react";
import { theme } from "@/config/theme";
import { useAuth, type UserRole } from "@/context/AuthContext";

/* ── Constants ────────────────────────────────────────────────── */
export const SIDEBAR_COLLAPSED_W = 68;
export const SIDEBAR_EXPANDED_W = 240;

/* ── Navigation Items ─────────────────────────────────────────── */
interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin", "manager", "recruiter"],
  },
  {
    label: "Approvals",
    icon: ClipboardCheck,
    path: "/approvals",
    roles: ["admin", "manager", "recruiter"],
  },
  {
    label: "Candidates",
    icon: Users,
    path: "/candidates",
    roles: ["admin", "manager", "recruiter"],
  },
  {
    label: "Clients",
    icon: Users,
    path: "/clients",
    roles: ["admin", "manager"],
  },
  {
    label: "Jobs",
    icon: BriefcaseBusiness,
    path: "/positions",
    roles: ["admin", "manager", "recruiter"],
  },
];

const bottomNavItems: NavItem[] = [
  { label: "Users", icon: Users, path: "/users", roles: ["admin", "manager"] },
  {
    label: "Audit Logs",
    icon: Activity,
    path: "/audit-logs",
    roles: ["admin"],
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
    roles: ["admin", "manager", "recruiter"],
  },
];

/* ── Sidebar Props ────────────────────────────────────────────── */
interface AppSidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/* ── Sidebar Component ────────────────────────────────────────── */
const AppSidebar = ({
  expanded,
  onMouseEnter,
  onMouseLeave,
}: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Fallback to empty array if user is null (should be handled by protected routes)
  const currentRole = user?.role?.toLowerCase() || "";
  const allowedMainItems = mainNavItems.filter((item) =>
    item.roles.includes(currentRole),
  );
  const allowedBottomItems = bottomNavItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed top-0 left-0 z-50 flex h-screen flex-col overflow-hidden"
      style={{
        width: expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
        background: theme.sidebar,
        borderRight: `1px solid ${theme.sidebarBorder}`,
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: theme.accent }}
        >
          <Zap className="size-5" style={{ color: theme.accentForeground }} />
        </div>
        <div
          className="overflow-hidden whitespace-nowrap"
          style={{
            opacity: expanded ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          <h2
            className="text-sm font-bold tracking-wider"
            style={{ color: theme.sidebarForeground }}
          >
            RECRUIT-OS
          </h2>
          <p className="text-[10px]" style={{ color: theme.textMuted }}>
            Hiring Platform
          </p>
        </div>
      </div>

      <Separator style={{ background: theme.sidebarBorder }} />

      {/* ── Main Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col gap-1">
        {allowedMainItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            expanded={expanded}
            onClick={() => navigate(item.path)}
          />
        ))}

        {allowedBottomItems.length > 0 && (
          <div className="py-3 px-1">
            <Separator style={{ background: theme.sidebarBorder }} />
          </div>
        )}

        {allowedBottomItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            expanded={expanded}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* ── User Profile & Logout ─────────────────────────────── */}
      <div className="shrink-0">
        <Separator style={{ background: theme.sidebarBorder }} />
        <div className="p-3 space-y-2">
          {/* User Info */}
          <div
            className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer"
            style={{
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = theme.sidebarAccent)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Avatar
              className="size-8 shrink-0 ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            >
              {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name || "User"} />}
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: theme.accentSoft,
                  color: theme.accent,
                }}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div
              className="overflow-hidden whitespace-nowrap"
              style={{
                opacity: expanded ? 1 : 0,
                transition: "opacity 200ms ease",
              }}
            >
              <p
                className="text-sm font-medium truncate"
                style={{ color: theme.sidebarForeground }}
              >
                {user?.name || "User"}
              </p>
              <p
                className="text-[10px] truncate uppercase"
                style={{ color: theme.textMuted }}
              >
                {user?.role || ""}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-2 h-9"
            style={{
              color: theme.destructive,
            }}
            onClick={() => navigate("/login")}
          >
            <LogOut className="size-4 shrink-0" />
            <span
              className="whitespace-nowrap text-xs"
              style={{
                overflow: "hidden",
                width: expanded ? "auto" : 0,
                opacity: expanded ? 1 : 0,
                transition: "opacity 200ms ease, width 200ms ease",
              }}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

/* ── Single Nav Item ──────────────────────────────────────────── */
interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}

const SidebarNavItem = ({
  item,
  active,
  expanded,
  onClick,
}: SidebarNavItemProps) => {
  const Icon = item.icon;

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium outline-none"
        style={{
          background: active ? theme.sidebarAccent : "transparent",
          color: active
            ? theme.sidebarPrimaryForeground
            : theme.textSecondary,
          transition: "background 150ms ease, color 150ms ease",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = theme.sidebarAccent;
            e.currentTarget.style.color = theme.sidebarAccentForeground;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = theme.textSecondary;
          }
        }}
      >
        <div className="relative shrink-0 flex items-center justify-center size-5">
          {active && (
            <span
              className="absolute -left-[14px] h-5 w-[3px] rounded-r-full"
              style={{ background: theme.accent }}
            />
          )}
          <Icon
            className="size-[18px]"
            style={{
              color: active ? theme.accent : undefined,
            }}
          />
        </div>
        <span
          className="whitespace-nowrap"
          style={{
            overflow: "hidden",
            width: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
            transition: "opacity 200ms ease, width 200ms ease",
          }}
        >
          {item.label}
        </span>
      </button>
    </div>
  );
};

export default AppSidebar;

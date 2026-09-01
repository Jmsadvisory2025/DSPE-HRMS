import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar, {
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
} from '@/components/layout/AppSidebar';
import AppTopbar from '@/components/layout/AppTopbar';
import { theme } from '@/config/theme';

const SIDEBAR_PIN_KEY = 'recruit-os-sidebar-pinned';

/**
 * DashboardLayout wraps authenticated pages with the sidebar.
 * The content area smoothly shifts when the sidebar expands / collapses.
 * Sidebar can be "pinned" open via a toggle button (persisted in localStorage).
 */
const DashboardLayout = () => {
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_PIN_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [hoverExpanded, setHoverExpanded] = useState(false);

  const isExpanded = sidebarPinned || hoverExpanded;

  const handleTogglePin = () => {
    const next = !sidebarPinned;
    setSidebarPinned(next);
    // If unpinning, also kill the hover state so it collapses immediately
    if (!next) setHoverExpanded(false);
    try {
      localStorage.setItem(SIDEBAR_PIN_KEY, String(next));
    } catch { /* ignore */ }
  };

  return (
    <TooltipProvider delay={0}>
      <div
        className="min-h-screen w-full"
        style={{ background: theme.background }}
      >
        <AppSidebar
          expanded={isExpanded}
          pinned={sidebarPinned}
          onMouseEnter={() => setHoverExpanded(true)}
          onMouseLeave={() => setHoverExpanded(false)}
          onTogglePin={handleTogglePin}
        />

        {/* Main content area — shifts with sidebar */}
        <main
          className="min-h-screen flex flex-col"
          style={{
            marginLeft: isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
            transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AppTopbar />
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;



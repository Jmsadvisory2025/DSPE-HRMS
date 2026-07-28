import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppSidebar, {
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
} from '@/components/layout/AppSidebar';
import AppTopbar from '@/components/layout/AppTopbar';
import { theme } from '@/config/theme';

/**
 * DashboardLayout wraps authenticated pages with the sidebar.
 * The content area smoothly shifts when the sidebar expands / collapses.
 */
const DashboardLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="min-h-screen w-full"
        style={{ background: theme.background }}
      >
        <AppSidebar
          expanded={sidebarExpanded}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        />

        {/* Main content area — shifts with sidebar */}
        <main
          className="min-h-screen flex flex-col"
          style={{
            marginLeft: sidebarExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
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


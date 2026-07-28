import React from 'react';
import { theme } from '@/config/theme';

const TABS = ['Overview', 'Positions', 'Submissions', 'Documents', 'Trackers'] as const;
export type ClientTabKey = (typeof TABS)[number];

interface ClientTabsProps {
  activeTab: ClientTabKey;
  onTabChange: (tab: ClientTabKey) => void;
}

const ClientTabs = ({ activeTab, onTabChange }: ClientTabsProps) => {
  return (
    <div
      className="flex gap-0"
      style={{ borderBottom: `1px solid ${theme.border}` }}
    >
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="relative px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: isActive ? theme.accent : theme.textMuted,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = theme.textSecondary;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = theme.textMuted;
            }}
          >
            {tab}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                style={{ background: theme.accent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ClientTabs;

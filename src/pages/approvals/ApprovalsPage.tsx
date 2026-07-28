import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { theme } from '@/config/theme';
import { APPROVALS_DATA } from './data';
import { useAuth } from '@/context/AuthContext';

const TABS = ['Pending', 'Returned', 'All'] as const;
type TabKey = typeof TABS[number];

const ApprovalsPage = () => {
  const { user, isRecruiter } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('Pending');

  const pendingCount = APPROVALS_DATA.filter((a) => {
    if (isRecruiter && a.submittedBy !== user.name) return false;
    return a.status === 'Pending Approval';
  }).length;

  const filteredApprovals = APPROVALS_DATA.filter((a) => {
    if (isRecruiter && a.submittedBy !== user.name) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return a.status === 'Pending Approval';
    if (activeTab === 'Returned') return a.status === 'Returned';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Approval Queue
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          Review, approve or return submissions from your team.
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-6"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                color: isActive ? theme.accent : theme.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              {tab}
              {tab === 'Pending' && pendingCount > 0 && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 text-[10px] font-bold border-0"
                  style={{
                    background: theme.warningSoft,
                    color: theme.warning,
                  }}
                >
                  {pendingCount}
                </Badge>
              )}
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

      {/* List */}
      <div className="space-y-3 pt-2">
        {filteredApprovals.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: theme.textMuted }}>
            No submissions found for this tab.
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              {/* Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span
                    className="text-base font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {approval.candidateName}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 border-0 font-medium"
                    style={{
                      background: theme.warningSoft,
                      color: theme.warning,
                    }}
                  >
                    {approval.status}
                  </Badge>
                </div>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {approval.designation} · {approval.client} · Submitted by {approval.submittedBy} · {approval.submittedAt}
                </p>
              </div>

              {/* Actions */}
              {!isRecruiter && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 font-medium"
                    style={{
                      borderColor: theme.destructive + '50',
                      color: theme.destructive,
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 font-medium"
                    style={{
                      borderColor: theme.warning + '50',
                      color: theme.warning,
                    }}
                  >
                    Return
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-5 font-medium"
                    style={{
                      background: theme.accent,
                      color: theme.accentForeground,
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
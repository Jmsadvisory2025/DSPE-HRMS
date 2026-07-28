import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Activity } from 'lucide-react';
import { theme } from '@/config/theme';
import { AUDIT_LOGS_DATA } from './data';

const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = AUDIT_LOGS_DATA.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <Activity className="size-6" style={{ color: theme.accent }} />
            Audit Logs
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            System-wide security and activity tracker. Retained for 90 days.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
              style={{ color: theme.textMuted }}
            />
            <Input
              placeholder="Search user, action, or resource..."
              className="pl-9 text-sm h-9"
              style={{
                background: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0">
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead
              className="text-xs uppercase"
              style={{
                background: theme.surfaceMuted,
                color: theme.textMuted,
              }}
            >
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Timestamp</th>
                <th className="px-5 py-4 font-semibold">User</th>
                <th className="px-5 py-4 font-semibold">Action</th>
                <th className="px-5 py-4 font-semibold">Resource</th>
                <th className="px-5 py-4 font-semibold w-full">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center" style={{ color: theme.textMuted }}>
                    No audit logs match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  // Action Badge Styling
                  const getActionStyle = (action: string) => {
                    switch (action) {
                      case 'CREATE':
                      case 'APPROVE':
                        return { color: theme.success, bg: theme.successSoft };
                      case 'UPDATE':
                        return { color: theme.info, bg: theme.infoSoft };
                      case 'DELETE':
                      case 'REJECT':
                        return { color: theme.destructive, bg: theme.destructive + '15' };
                      case 'LOGIN':
                        return { color: theme.chart2, bg: theme.chart2 + '20' };
                      case 'EXPORT':
                        return { color: theme.textSecondary, bg: theme.surfaceMuted };
                      default:
                        return { color: theme.textMuted, bg: theme.surfaceMuted };
                    }
                  };

                  const actionStyle = getActionStyle(log.action);

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderTop: index !== 0 ? `1px solid ${theme.border}` : 'none',
                      }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-xs" style={{ color: theme.textSecondary }}>
                        {log.timestamp}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: theme.textPrimary }}>
                            {log.user}
                          </span>
                          <span className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                            {log.role} · {log.ipAddress}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className="border-0 font-bold px-2 py-0.5 text-[10px] tracking-wider"
                          style={{ color: actionStyle.color, background: actionStyle.bg }}
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-medium" style={{ color: theme.textSecondary }}>
                        {log.resource}
                      </td>
                      <td className="px-5 py-4 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;

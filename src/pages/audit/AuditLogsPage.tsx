import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch } from '@/store/hooks';
import { auditActions } from '@/redux/actions';
import { AuditLogDetailModal } from './components/AuditLogDetailModal';

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  action: string;
  user_info: {
    name: string | null;
    role: string | null;
    email: string | null;
    organization: string | null;
  } | null;
  method: string | null;
  status_code: number | null;
  path: string | null;
}

interface AuditResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

const AuditLogsPage = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AuditResponse | null>(null);
  const [page, setPage] = useState(1);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const fetchLogs = (targetPage: number = 1) => {
    dispatch({
      type: auditActions.FETCH_AUDIT_LOGS,
      method: 'GET',
      endPoint: `/api/v1/audit/?page=${targetPage}`,
      auth: true,
      setLoading: (val: boolean) => setLoading(val),
      getResponse: (res: AuditResponse) => {
        if (res && res.results) {
          setData(res);
        }
      },
      getError: (err: any) => console.error("Error fetching audit logs:", err),
    });
  };

  useEffect(() => {
    fetchLogs(page);
  }, [dispatch, page]);

  // Client-side search (note: API might support search, but we apply local filter on current page)
  const filteredLogs = data?.results.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.user_info?.name || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.event || '').toLowerCase().includes(q) ||
      (log.path || '').toLowerCase().includes(q)
    );
  }) || [];

  const handleNextPage = () => {
    if (data?.next) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (data?.previous) {
      setPage(prev => prev - 1);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

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
        className="rounded-xl overflow-hidden flex flex-col"
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
                <th className="px-5 py-3 font-semibold whitespace-nowrap w-[15%]">Timestamp</th>
                <th className="px-5 py-3 font-semibold w-[25%]">User</th>
                <th className="px-5 py-3 font-semibold w-[10%]">Action</th>
                <th className="px-5 py-3 font-semibold w-[20%]">Event / Resource</th>
                <th className="px-5 py-3 font-semibold w-auto">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2" style={{ color: theme.accent }} />
                    <span style={{ color: theme.textMuted }}>Loading audit logs...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center" style={{ color: theme.textMuted }}>
                    No audit logs match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const getActionStyle = (action: string | null) => {
                    const act = action?.toUpperCase() || '';
                    switch (act) {
                      case 'CREATED':
                      case 'APPROVE':
                      case 'SENT':
                        return { color: theme.success, bg: theme.successSoft };
                      case 'UPDATED':
                      case 'REVIEWED':
                        return { color: theme.info, bg: theme.infoSoft };
                      case 'DELETED':
                      case 'REJECTED':
                        return { color: theme.destructive, bg: theme.destructive + '15' };
                      case 'LOGGED_IN':
                        return { color: theme.chart2, bg: theme.chart2 + '20' };
                      case 'READ':
                        return { color: theme.textSecondary, bg: theme.surfaceMuted };
                      default:
                        return { color: theme.textMuted, bg: theme.surfaceMuted };
                    }
                  };

                  const actionStyle = getActionStyle(log.action);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      style={{
                        borderTop: index !== 0 ? `1px solid ${theme.border}` : 'none',
                      }}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: theme.textSecondary }}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium capitalize" style={{ color: theme.textPrimary }}>
                            {log.user_info?.name || 'System'}
                          </span>
                          <span className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                            <span className="capitalize">{log.user_info?.role || 'System'}</span> · {log.user_info?.email?.toLowerCase() || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className="border-0 font-bold px-2.5 py-0.5 text-[10px] tracking-wider uppercase"
                          style={{ color: actionStyle.color, background: actionStyle.bg }}
                        >
                          {log.action || 'UNKNOWN'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-medium text-sm" style={{ color: theme.textSecondary }}>
                        {log.event}
                      </td>
                      <td className="px-5 py-3 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                        {log.path ? (
                          <div className="flex items-center gap-2 font-mono bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded w-max" style={{ color: theme.textSecondary }}>
                            <span className="font-bold">{log.method}</span>
                            <span>{log.path}</span>
                            {log.status_code && (
                              <span className={log.status_code >= 400 ? 'text-red-500' : 'text-green-600'}>
                                {log.status_code}
                              </span>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data && data.count > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: theme.border, background: theme.surfaceMuted }}>
            <div className="text-xs font-medium" style={{ color: theme.textMuted }}>
              Showing page {page} <span className="mx-1">•</span> Total {data.count} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!data.previous || loading}
                className="h-8 px-2"
                style={{ borderColor: theme.border, color: theme.textPrimary }}
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!data.next || loading}
                className="h-8 px-2"
                style={{ borderColor: theme.border, color: theme.textPrimary }}
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AuditLogDetailModal 
        isOpen={!!selectedLogId} 
        onClose={() => setSelectedLogId(null)} 
        logId={selectedLogId} 
      />
    </div>
  );
};

export default AuditLogsPage;

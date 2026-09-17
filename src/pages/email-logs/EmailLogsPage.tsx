import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch } from '@/store/hooks';
import { emailLogActions } from '@/redux/actions';
import { EmailLogDetailModal } from './components/EmailLogDetailModal';

interface SenderInfo {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

interface CandidateInfo {
  id: string;
  name: string;
}

interface EmailLog {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  recipient_email: string;
  cc_emails: string[];
  subject: string;
  body_text: string | null;
  body_html: string | null;
  event: string | null;
  email_type: string;
  candidate_name: string | null;
  status: string;
  error_message: string;
  sent_at: string;
  sender: string;
  candidate: string | null;
  organization: string;
  sender_info: SenderInfo | null;
  candidate_info: CandidateInfo | null;
}

interface EmailLogResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EmailLog[];
}

/** Strip HTML tags and return a plain-text snippet */
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};

const EmailLogsPage = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmailLogResponse | null>(null);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ordering, setOrdering] = useState('-sent_at');

  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const applySearch = () => {
    setAppliedSearch(searchQuery);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };

  // 1-second debounce fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(searchQuery);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch email logs with applied filters
  useEffect(() => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (appliedSearch) params.append('search', appliedSearch);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (typeFilter !== 'all') params.append('email_type', typeFilter);
    if (ordering) params.append('ordering', ordering);

    dispatch({
      type: emailLogActions.FETCH_EMAIL_LOGS,
      method: 'GET',
      endPoint: `/api/v1/notifications/email-logs/?${params.toString()}`,
      auth: true,
      setLoading: (val: boolean) => setLoading(val),
      getResponse: (res: EmailLogResponse) => {
        if (res && res.results) {
          setData(res);
        }
      },
      getError: (err: any) => console.error("Error fetching email logs:", err),
    });
  }, [dispatch, page, appliedSearch, statusFilter, typeFilter, ordering]);

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

  const handleClear = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setOrdering('-sent_at');
    setPage(1);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent':
        return { color: theme.success, bg: theme.successSoft };
      case 'failed':
        return { color: theme.destructive, bg: theme.destructive + '15' };
      case 'pending':
        return { color: theme.warning, bg: theme.warningSoft };
      default:
        return { color: theme.textMuted, bg: theme.surfaceMuted };
    }
  };

  const getEmailTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const hasActiveFilters = !!(appliedSearch || statusFilter !== 'all' || typeFilter !== 'all' || ordering !== '-sent_at');

  // Calculate total pages
  const pageSize = 10; // default DRF page size
  const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            style={{ color: theme.textPrimary }}
          >
            <Mail className="size-6" style={{ color: theme.accent }} />
            Email Logs
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Track all outgoing emails sent from the system.
            {data && <span className="ml-1">({data.count} total)</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search emails, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 pl-8 text-xs w-full sm:w-[250px]"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 py-1 text-xs outline-none cursor-pointer"
            style={{ borderColor: theme.border }}
          >
            <option value="all">All Types</option>
            <option value="job_assigned">Job Assigned</option>
            <option value="candidate_submitted">Candidate Submitted</option>
            <option value="approval_request">Approval Request</option>
            <option value="client_update">Client Update</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 py-1 text-xs outline-none cursor-pointer"
            style={{ borderColor: theme.border }}
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 py-1 text-xs outline-none cursor-pointer"
            style={{ borderColor: theme.border }}
          >
            <option value="-sent_at">Newest First</option>
            <option value="sent_at">Oldest First</option>
            <option value="status">Status</option>
            <option value="email_type">Email Type</option>
          </select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClear} className="h-9 text-xs shrink-0">
              Clear Filters
            </Button>
          )}
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
          <table className="w-full text-sm text-left" style={{ minWidth: '900px' }}>
            <thead
              className="text-xs uppercase"
              style={{
                background: theme.surfaceMuted,
                color: theme.textMuted,
              }}
            >
              <tr>
                <th className="px-5 py-3 font-semibold whitespace-nowrap w-[13%]">Sent At</th>
                <th className="px-5 py-3 font-semibold w-[18%]">Recipient</th>
                <th className="px-5 py-3 font-semibold w-[22%]">Subject</th>
                <th className="px-5 py-3 font-semibold w-[10%]">Type</th>
                <th className="px-5 py-3 font-semibold w-[8%]">Status</th>
                <th className="px-5 py-3 font-semibold w-[17%]">Body Preview</th>
                <th className="px-5 py-3 font-semibold w-[12%]">Sent By</th>
              </tr>

            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2" style={{ color: theme.accent }} />
                    <span style={{ color: theme.textMuted }}>Loading email logs...</span>
                  </td>
                </tr>
              ) : (data?.results || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center" style={{ color: theme.textMuted }}>
                    No email logs match your search criteria.
                  </td>
                </tr>
              ) : (
                (data?.results || []).map((log, index) => {
                  const statusStyle = getStatusStyle(log.status);
                  const bodySnippet = log.body_text
                    ? log.body_text.substring(0, 120)
                    : log.body_html
                      ? stripHtml(log.body_html).substring(0, 120)
                      : '—';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderTop: index !== 0 ? `1px solid ${theme.border}` : 'none',
                        cursor: 'pointer'
                      }}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: theme.textSecondary }}>
                        {formatDate(log.sent_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                            {log.recipient_email}
                          </span>
                          {log.cc_emails && log.cc_emails.length > 0 && (
                            <span className="text-[10px] mt-0.5 truncate" style={{ color: theme.textMuted }}>
                              CC: {log.cc_emails.join(', ')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate" style={{ color: theme.textSecondary }}>
                            {log.subject}
                          </span>
                          {log.candidate_name && (
                            <span className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                              Candidate: {log.candidate_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className="border-0 font-semibold px-2 py-0.5 text-[10px] tracking-wider capitalize"
                          style={{ color: theme.accent, background: theme.accentSoft }}
                        >
                          {getEmailTypeLabel(log.email_type)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className="border-0 font-bold px-2 py-0.5 text-[10px] tracking-wider uppercase"
                          style={{ color: statusStyle.color, background: statusStyle.bg }}
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                        <div className="truncate max-w-[200px]" title={bodySnippet}>
                          {bodySnippet}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                            {log.sender_info?.name || 'System'}
                          </span>
                          <span className="text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
                            {log.sender_info?.email || ''}
                          </span>
                        </div>
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
              Showing page {page}{totalPages > 0 && ` of ${totalPages}`} <span className="mx-1">•</span> Total {data.count} records
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

      <EmailLogDetailModal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />
    </div>
  );
};

export default EmailLogsPage;

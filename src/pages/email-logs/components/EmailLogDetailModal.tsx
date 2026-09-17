import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { theme } from '@/config/theme';

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

interface EmailLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: EmailLog | null;
}

export const EmailLogDetailModal: React.FC<EmailLogDetailModalProps> = ({ isOpen, onClose, log }) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  if (!log) return null;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="size-3.5 mr-1" />;
      case 'failed':
        return <AlertCircle className="size-3.5 mr-1" />;
      case 'pending':
        return <Clock className="size-3.5 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'sent':
        return { color: theme.success, background: theme.successSoft };
      case 'failed':
        return { color: theme.destructive, background: theme.destructive + '15' };
      case 'pending':
        return { color: theme.warning, background: theme.warningSoft };
      default:
        return { color: theme.textMuted, background: theme.surfaceMuted };
    }
  };

  const getEmailTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden" style={{ background: theme.background }}>
        
        {/* Header Section */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center gap-4" style={{ borderColor: theme.border, background: theme.surface }}>
          <div className="size-10 rounded-lg flex items-center justify-center" style={{ background: theme.accent, color: '#fff' }}>
            <Mail className="size-5" />
          </div>
          <div className="flex-1">
            <DialogTitle style={{ color: theme.textPrimary, fontSize: '18px' }}>Email Log Detail</DialogTitle>
            <p className="text-xs font-mono mt-0.5" style={{ color: theme.textMuted }}>{log.id}</p>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Badges Section */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="border-0 font-medium px-2.5 py-1 text-xs gap-1 capitalize" 
              style={getStatusStyle(log.status)}
            >
              {getStatusIcon(log.status)}
              {log.status}
            </Badge>
            <Badge 
              variant="outline" 
              className="border-0 font-medium px-2.5 py-1 text-xs"
              style={{ color: theme.textSecondary, background: theme.surfaceMuted }}
            >
              System Email
            </Badge>
            <Badge 
              variant="outline" 
              className="border-0 font-medium px-2.5 py-1 text-xs"
              style={{ color: theme.accent, background: theme.accentSoft }}
            >
              {getEmailTypeLabel(log.email_type)}
            </Badge>
          </div>

          {/* Email Information Section */}
          <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
            <div className="px-4 py-2 border-b" style={{ borderColor: theme.border, background: theme.surfaceHover }}>
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: theme.textMuted }}>Email Information</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>Sender</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  {log.sender_info?.name || 'System'}
                </p>
                {log.sender_info?.email && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>{log.sender_info.email}</p>
                )}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>Recipient</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{log.recipient_email}</p>
              </div>

              {log.cc_emails && log.cc_emails.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>CC</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.cc_emails.map((cc, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: theme.surfaceMuted, color: theme.textSecondary }}>
                        {cc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>Subject</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{log.subject}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>Candidate / Context</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{log.candidate_name || '—'}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: theme.textMuted }}>Sent At</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{formatDate(log.sent_at)}</p>
              </div>
              
              {log.status === 'failed' && log.error_message && (
                <div className="md:col-span-2 mt-2 p-3 rounded-md" style={{ background: theme.destructive + '15', border: `1px solid ${theme.destructive}40` }}>
                  <p className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: theme.destructive }}>Error Message</p>
                  <p className="text-sm font-mono" style={{ color: theme.destructive }}>{log.error_message}</p>
                </div>
              )}

            </div>
          </div>

          {/* Email Body Section */}
          <div className="rounded-xl overflow-hidden shadow-sm flex flex-col" style={{ border: `1px solid ${theme.border}`, background: theme.surface, minHeight: '400px' }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: theme.border, background: theme.surfaceHover }}>
              <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: theme.textMuted }}>Email Body</span>
              
              <div className="flex bg-muted/50 p-0.5 rounded-lg" style={{ background: theme.surfaceMuted }}>
                <button
                  onClick={() => setViewMode('html')}
                  className="px-3 py-1 text-[11px] font-medium rounded-md transition-colors"
                  style={{ 
                    background: viewMode === 'html' ? theme.surface : 'transparent',
                    color: viewMode === 'html' ? theme.textPrimary : theme.textSecondary,
                    boxShadow: viewMode === 'html' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setViewMode('text')}
                  className="px-3 py-1 text-[11px] font-medium rounded-md transition-colors"
                  style={{ 
                    background: viewMode === 'text' ? theme.surface : 'transparent',
                    color: viewMode === 'text' ? theme.textPrimary : theme.textSecondary,
                    boxShadow: viewMode === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Plain Text
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-gray-50/50 dark:bg-white/5 relative h-[500px]">
              <div className="absolute inset-4 overflow-y-auto rounded-lg border bg-white shadow-sm p-4" style={{ borderColor: theme.border }}>
                {viewMode === 'html' && log.body_html ? (
                  <iframe 
                    srcDoc={log.body_html} 
                    className="w-full h-full border-0" 
                    title="Email Preview"
                  />
                ) : (
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 h-full w-full">
                    {log.body_text || (log.body_html ? log.body_html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : 'No content available')}
                  </pre>
                )}
              </div>
            </div>

          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

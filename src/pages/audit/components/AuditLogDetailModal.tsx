import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch } from '@/store/hooks';
import { auditActions } from '@/redux/actions';
import { Loader2, Copy, Check } from 'lucide-react';
import { theme } from '@/config/theme';
import { Button } from '@/components/ui/button';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ isOpen, onClose, logId }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [logDetail, setLogDetail] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && logId) {
      dispatch({
        type: auditActions.FETCH_AUDIT_LOG_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/audit/${logId}/`,
        auth: true,
        setLoading: (val: boolean) => setLoading(val),
        getResponse: (res: any) => {
          setLogDetail(res);
        },
        getError: (err: any) => {
          console.error("Failed to fetch audit log details", err);
        },
      });
    } else {
      setLogDetail(null);
      setCopied(false);
    }
  }, [isOpen, logId, dispatch]);

  const handleCopy = () => {
    if (logDetail) {
      navigator.clipboard.writeText(JSON.stringify(logDetail, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[85vh] flex flex-col p-0 overflow-hidden" style={{ background: theme.background }}>
        <DialogHeader className="px-6 py-4 border-b shrink-0" style={{ borderColor: theme.border, background: theme.surface }}>
          <DialogTitle style={{ color: theme.textPrimary }}>Detailed Audit Entry</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-black/5 dark:bg-black/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin mb-4" style={{ color: theme.accent }} />
              <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Fetching complete audit data...</span>
            </div>
          ) : logDetail ? (
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
              <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: theme.border, background: theme.surfaceMuted }}>
                <span className="text-xs font-semibold tracking-wider" style={{ color: theme.textMuted }}>RAW RESPONSE (JSON)</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs gap-1.5"
                  style={{ color: theme.textSecondary }}
                >
                  {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre 
                className="p-5 text-[13px] font-mono whitespace-pre overflow-x-auto leading-relaxed"
                style={{ color: theme.textPrimary, background: theme.surface }}
              >
                {JSON.stringify(logDetail, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="py-12 text-center text-sm" style={{ color: theme.textMuted }}>
              No details found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

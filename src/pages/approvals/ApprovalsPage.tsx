import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { approvalActions } from '@/redux/actions';
import { setApplications, setLoading, setError } from '@/redux/slices/approvalSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { theme } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';
import { Download, Eye } from 'lucide-react';
import { ReviewActionModal } from './components/ReviewActionModal';

const TABS = [ 'All','Pending', 'Approved', 'Rejected'] as const;
type TabKey = typeof TABS[number];

const ApprovalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isRecruiter } = useAuth();
  const { applications, loading } = useAppSelector((state) => state.approvals);
  const [activeTab, setActiveTab] = useState<TabKey>('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accepted' | 'rejected' | 'resubmit' | null>(null);
  const [targetAppId, setTargetAppId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = () => {
    dispatch({
      type: approvalActions.FETCH_APPLICATIONS,
      method: 'GET',
      endPoint: '/api/v1/candidates/applications/',
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: any) => dispatch(setApplications(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  };

  useEffect(() => {
    fetchApplications();
  }, [dispatch]);

  const handleActionClick = (e: React.MouseEvent, appId: string, type: 'accepted' | 'rejected' | 'resubmit') => {
    e.stopPropagation();
    setTargetAppId(appId);
    setActionType(type);
    setModalOpen(true);
  };

  const submitAction = (notes: string) => {
    if (!targetAppId || !actionType) return;
    setSubmitting(true);
    
    dispatch({
      type: approvalActions.REVIEW_APPLICATION,
      method: 'POST',
      endPoint: `/api/v1/candidates/applications/${targetAppId}/review/`,
      auth: true,
      body: {
        status: actionType,
        notes: notes
      },
      setLoading: (val: boolean) => {
         if(!val) setSubmitting(false); // Stop loading when done
      },
      getResponse: (data: any) => {
        setModalOpen(false);
        fetchApplications(); // Refresh list
      },
      getError: (err: any) => {
        // Here you could dispatch an error toast instead
        console.error("Action failed:", err);
      },
    });
  };

  const pendingCount = applications.filter((a) => {
    if (isRecruiter && a.submitted_by.name !== user.name) return false;
    return a.manager_review_status.toLowerCase() === 'pending';
  }).length;

  const filteredApplications = applications.filter((a) => {
    if (isRecruiter && a.submitted_by.name !== user.name) return false;

    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return a.manager_review_status.toLowerCase() === 'pending';
    if (activeTab === 'Approved') return a.manager_review_status.toLowerCase() === 'approved';
    if (activeTab === 'Rejected') return a.manager_review_status.toLowerCase() === 'rejected';
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
          Review, approve or return applications from your team.
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

      {/* List / Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          borderColor: theme.border,
          background: theme.surface,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              className="hover:bg-transparent"
              style={{ borderColor: theme.border }}
            >
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider min-w-[200px]"
                style={{ color: theme.textMuted }}
              >
                Candidate Info
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider min-w-[140px]"
                style={{ color: theme.textMuted }}
              >
                Job Title
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider min-w-[120px]"
                style={{ color: theme.textMuted }}
              >
                Status
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider min-w-[160px]"
                style={{ color: theme.textMuted }}
              >
                Submitted By
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider min-w-[100px]"
                style={{ color: theme.textMuted }}
              >
                Date
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider text-right min-w-[220px]"
                style={{ color: theme.textMuted }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm"
                  style={{ color: theme.textMuted }}
                >
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm"
                  style={{ color: theme.textMuted }}
                >
                  No applications found for this tab.
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow
                  key={app.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/approvals/${app.id}`)}
                  style={{ borderColor: theme.border }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = theme.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {/* Candidate Info */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm font-semibold truncate max-w-[200px]"
                        style={{ color: theme.textPrimary }}
                      >
                        {app.candidate_name || "N/A"}
                      </span>
                      <span
                        className="text-xs truncate max-w-[200px]"
                        style={{ color: theme.textSecondary }}
                      >
                        {app.candidate_email || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Job Title */}
                  <TableCell>
                    <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {app.job_title || "N/A"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 border-0 font-medium capitalize"
                        style={{
                          background: app.manager_review_status === 'pending'
                            ? theme.warningSoft
                            : app.manager_review_status === 'approved' || app.manager_review_status === 'accepted'
                            ? theme.successSoft
                            : theme.destructive + '20',
                          color: app.manager_review_status === 'pending'
                            ? theme.warning
                            : app.manager_review_status === 'approved' || app.manager_review_status === 'accepted'
                            ? theme.success
                            : theme.destructive,
                        }}
                      >
                        {app.manager_review_status === 'accepted' ? 'approved' : app.manager_review_status || 'Pending'}
                      </Badge>
                      <span className="text-[10px] uppercase font-semibold" style={{ color: theme.textMuted }}>
                        Stage: {app.stage_name || app.status || 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Submitted By */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm font-medium truncate max-w-[150px]"
                        style={{ color: theme.textPrimary }}
                      >
                        {app.submitted_by?.name || "N/A"}
                      </span>
                      <span
                        className="text-xs capitalize truncate max-w-[150px]"
                        style={{ color: theme.textSecondary }}
                      >
                        {app.submitted_by?.role || "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm" style={{ color: theme.textSecondary }}>
                        {app.share_date ? new Date(app.share_date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {app.candidate_cv && (
                        <a href={app.candidate_cv} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            title="View CV"
                            style={{
                              borderColor: theme.border,
                              color: theme.textSecondary,
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </a>
                      )}
                      
                      {!isRecruiter && app.manager_review_status.toLowerCase() === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-medium"
                            style={{
                              borderColor: theme.destructive + '50',
                              color: theme.destructive,
                            }}
                            onClick={(e) => handleActionClick(e, app.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-medium"
                            style={{
                              borderColor: theme.warning + '50',
                              color: theme.warning,
                            }}
                            onClick={(e) => handleActionClick(e, app.id, 'resubmit')}
                          >
                            Re-Submission
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs font-medium"
                            style={{
                              background: theme.success,
                              color: '#fff',
                            }}
                            onClick={(e) => handleActionClick(e, app.id, 'accepted')}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <ReviewActionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={submitAction} 
        actionType={actionType}
        loading={submitting}
      />
    </div>
  );
};

export default ApprovalsPage;